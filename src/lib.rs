//! Language servers for October CMS templates.
//!
//! An October `.htm` file is one buffer holding up to three sections — INI
//! config, PHP, then Twig markup — but Zed attaches language servers per
//! buffer, not per injected layer. Every server declared here therefore
//! receives the whole file. Two things keep that workable:
//!
//! * Each borrowed server is handed the LSP language id of the section it
//!   cares about (see `language_ids` in extension.toml). The sections it does
//!   not care about degrade to inert text: PHP treats everything outside
//!   `<?php ?>` as inline HTML, and the HTML server treats the rest as text.
//!   `october-language-server` is ours and reads the whole template on
//!   purpose, so it needs no id mapping.
//! * `scope_opt_in_language_servers` in the language configs stops Zed from
//!   asking a server for completions in a section it has no business in — no
//!   PHP completions in the INI header, no HTML tags inside `<?php ?>`.
//!
//! Each server is declared under its canonical id (`intelephense`, not
//! `october-intelephense`) so a user's existing `lsp: { intelephense: … }`
//! settings apply here too. Zed keys language servers per language, so this
//! does not collide with the PHP, HTML or Emmet extensions declaring the same
//! ids for their own languages.
//!
//! There is deliberately no Twig server. twiggy-language-server was tried and
//! removed: it reports "Unexpected syntax" on any node its parser rejects, and
//! that covers two things every October project contains — route parameter
//! bindings in the INI header (`pageNumber = "{{ :page }}"`) and named tag
//! parameters (`{% partial 'footer' year=2026 %}`). Neither is valid upstream
//! Twig, the warning is not configurable (twiggy only exposes a `twigCsFixer`
//! toggle), and it cannot resolve `{% partial %}` or `{% component %}` paths
//! either, so it was a false-positive generator with nothing to offset it.

use std::{env, fs};

use zed::settings::LspSettings;
use zed_extension_api::{
    self as zed,
    serde_json::{json, Map, Value},
    LanguageServerId, Result,
};

const INTELEPHENSE: &str = "intelephense";
const HTML: &str = "vscode-html-language-server";
const EMMET: &str = "emmet-language-server";
const OCTOBER: &str = "october-language-server";

/// The document-link server, compiled into this wasm and written back out at
/// startup.
///
/// It cannot simply be shipped as a file: the packager copies only
/// `extension.toml`, `extension.wasm`, the grammars named in the manifest, the
/// `languages/` dirs, themes, icons, debug-adapter schemas and snippets
/// (`crates/extension_cli/src/main.rs`, `copy_extension_resources`). A stray
/// `server/` directory is dropped from the published archive, so it would work
/// as a dev extension and be missing for everyone who installs it.
const OCTOBER_SERVER_JS: &str = include_str!("../server/october-language-server.js");
const OCTOBER_SERVER_FILE: &str = "october-language-server.js";

/// The npm package that provides a server, and the entry script it installs.
fn npm_source(server_id: &str) -> Option<(&'static str, &'static str)> {
    Some(match server_id {
        INTELEPHENSE => (
            "intelephense",
            "node_modules/intelephense/lib/intelephense.js",
        ),
        HTML => (
            "@zed-industries/vscode-langservers-extracted",
            "node_modules/@zed-industries/vscode-langservers-extracted/bin/vscode-html-language-server",
        ),
        EMMET => (
            "@olrtg/emmet-language-server",
            "node_modules/@olrtg/emmet-language-server/dist/index.js",
        ),
        _ => return None,
    })
}

struct OctoberExtension {
    /// Servers whose npm package has already been resolved this session, so a
    /// server restart does not re-check the registry.
    resolved: Vec<String>,
}

/// How a server was located, which decides how it gets launched.
enum Server {
    /// An executable already on PATH — the user's own install, run directly.
    OnPath(String),
    /// A script we installed from npm, run through Node.
    NodeScript(String),
}

impl OctoberExtension {
    fn locate(&mut self, server_id: &LanguageServerId, worktree: &zed::Worktree) -> Result<Server> {
        let id = server_id.as_ref();
        if id == OCTOBER {
            return Ok(Server::NodeScript(unpack_october_server()?));
        }

        let (package, entry) =
            npm_source(id).ok_or_else(|| format!("unknown language server: {id}"))?;

        // A binary already on PATH wins; it is the user's own install and may
        // be a licensed or pinned build.
        if let Some(path) = worktree.which(id) {
            return Ok(Server::OnPath(path));
        }

        let installed = || fs::metadata(entry).is_ok_and(|stat| stat.is_file());
        if self.resolved.iter().any(|s| s == id) && installed() {
            return Ok(Server::NodeScript(absolute(entry)?));
        }

        zed::set_language_server_installation_status(
            server_id,
            &zed::LanguageServerInstallationStatus::CheckingForUpdate,
        );
        let latest = zed::npm_package_latest_version(package)?;

        if !installed() || zed::npm_package_installed_version(package)?.as_ref() != Some(&latest) {
            zed::set_language_server_installation_status(
                server_id,
                &zed::LanguageServerInstallationStatus::Downloading,
            );
            match zed::npm_install_package(package, &latest) {
                Ok(()) if !installed() => {
                    return Err(format!("package '{package}' did not contain '{entry}'"))
                }
                // Keep serving a stale-but-working copy when an update fails;
                // only surface the error if there is nothing to fall back to.
                Err(error) if !installed() => return Err(error),
                _ => {}
            }
        }

        self.resolved.push(id.to_string());
        Ok(Server::NodeScript(absolute(entry)?))
    }
}

fn absolute(path: &str) -> Result<String> {
    Ok(env::current_dir()
        .map_err(|err| format!("could not resolve the extension work directory: {err}"))?
        .join(path)
        .to_string_lossy()
        .into_owned())
}

/// Write the bundled document-link server into the extension work directory
/// and return its path. Rewritten only when the contents differ, so upgrading
/// the extension picks up a new server and a restart does not churn the disk.
fn unpack_october_server() -> Result<String> {
    let path = absolute(OCTOBER_SERVER_FILE)?;
    let current = fs::read_to_string(&path).ok();
    if current.as_deref() != Some(OCTOBER_SERVER_JS) {
        fs::write(&path, OCTOBER_SERVER_JS)
            .map_err(|err| format!("could not write {OCTOBER_SERVER_FILE}: {err}"))?;
    }
    Ok(path)
}

/// intelephense only indexes files whose name matches `files.associations`,
/// which defaults to `*.php` and `*.phtml`. October templates are `.htm`, so
/// without `*.htm` in that list the PHP section is invisible to it.
///
/// The list is appended to rather than replaced, and both spellings are
/// handled: Zed passes `lsp.intelephense.settings` through untouched, so it may
/// hold either the nested `files.associations` or the flat, VSCode-style
/// `"intelephense.files.associations"` key people tend to copy across.
fn ensure_htm_indexed(settings: Option<Value>) -> Result<Value> {
    const FLAT_KEY: &str = "intelephense.files.associations";
    const DEFAULTS: [&str; 3] = ["*.php", "*.phtml", "*.htm"];

    let mut settings = settings.unwrap_or_else(|| json!({}));
    let object = settings
        .as_object_mut()
        .ok_or("lsp.intelephense.settings must be an object")?;

    let mut found = false;

    if let Some(list) = object.get_mut(FLAT_KEY).and_then(Value::as_array_mut) {
        append_htm(list);
        found = true;
    }

    if let Some(files) = object.get_mut("files").and_then(Value::as_object_mut) {
        if let Some(list) = files.get_mut("associations").and_then(Value::as_array_mut) {
            append_htm(list);
            found = true;
        }
    }

    if !found {
        object
            .entry("files")
            .or_insert_with(|| Value::Object(Map::new()))
            .as_object_mut()
            .ok_or("lsp.intelephense.settings.files must be an object")?
            .insert("associations".into(), json!(DEFAULTS));
    }

    disable_language_constraints(object)?;

    Ok(settings)
}

/// October compiles the PHP section into a method body of a generated page
/// class, so `$this` (and other class-context syntax) is valid at runtime but
/// not statically — intelephense sees a bare top-level function and reports
/// "Cannot use $this in non-object context". This instance of intelephense
/// only ever attaches to `.htm` buffers (see module docs), so turning this
/// category off here does not touch diagnostics for real `.php` files
/// elsewhere in the project.
fn disable_language_constraints(object: &mut Map<String, Value>) -> Result<()> {
    const FLAT_KEY: &str = "intelephense.diagnostics.languageConstraints";

    if object.contains_key(FLAT_KEY) {
        return Ok(());
    }

    if let Some(diagnostics) = object.get("diagnostics") {
        if diagnostics
            .as_object()
            .is_some_and(|d| d.contains_key("languageConstraints"))
        {
            return Ok(());
        }
    }

    object
        .entry("diagnostics")
        .or_insert_with(|| Value::Object(Map::new()))
        .as_object_mut()
        .ok_or("lsp.intelephense.settings.diagnostics must be an object")?
        .insert("languageConstraints".into(), json!(false));

    Ok(())
}

fn append_htm(associations: &mut Vec<Value>) {
    if !associations.iter().any(|value| value == "*.htm") {
        associations.push(json!("*.htm"));
    }
}

impl zed::Extension for OctoberExtension {
    fn new() -> Self {
        Self {
            resolved: Vec::new(),
        }
    }

    fn language_server_command(
        &mut self,
        server_id: &LanguageServerId,
        worktree: &zed::Worktree,
    ) -> Result<zed::Command> {
        Ok(match self.locate(server_id, worktree)? {
            Server::OnPath(binary) => zed::Command {
                command: binary,
                args: vec!["--stdio".into()],
                env: Default::default(),
            },
            Server::NodeScript(script) => zed::Command {
                command: zed::node_binary_path()?,
                args: vec![script, "--stdio".into()],
                env: Default::default(),
            },
        })
    }

    fn language_server_initialization_options(
        &mut self,
        server_id: &LanguageServerId,
        worktree: &zed::Worktree,
    ) -> Result<Option<Value>> {
        let user = LspSettings::for_worktree(server_id.as_ref(), worktree)
            .ok()
            .and_then(|settings| settings.initialization_options);

        Ok(match server_id.as_ref() {
            // Without this the HTML server advertises no formatting support.
            HTML => Some(user.unwrap_or_else(|| json!({ "provideFormatter": true }))),
            _ => user,
        })
    }

    fn language_server_workspace_configuration(
        &mut self,
        server_id: &LanguageServerId,
        worktree: &zed::Worktree,
    ) -> Result<Option<Value>> {
        let user = LspSettings::for_worktree(server_id.as_ref(), worktree)
            .ok()
            .and_then(|settings| settings.settings);

        Ok(match server_id.as_ref() {
            INTELEPHENSE => Some(json!({ "intelephense": ensure_htm_indexed(user)? })),
            _ => user,
        })
    }
}

zed::register_extension!(OctoberExtension);

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn defaults_associations_when_the_user_set_none() {
        let defaulted = ensure_htm_indexed(None).unwrap();
        assert_eq!(
            defaulted["files"]["associations"],
            json!(["*.php", "*.phtml", "*.htm"])
        );

        // An unrelated `files` key must not be clobbered.
        let partial = json!({ "files": { "maxSize": 1000 } });
        let merged = ensure_htm_indexed(Some(partial)).unwrap();
        assert_eq!(merged["files"]["maxSize"], json!(1000));
        assert_eq!(
            merged["files"]["associations"],
            json!(["*.php", "*.phtml", "*.htm"])
        );
    }

    #[test]
    fn appends_htm_to_an_existing_list_in_either_spelling() {
        // Nested form.
        let nested = json!({ "files": { "associations": ["*.php"] } });
        assert_eq!(
            ensure_htm_indexed(Some(nested)).unwrap()["files"]["associations"],
            json!(["*.php", "*.htm"])
        );

        // Flat, VSCode-style form, with other settings alongside it.
        let flat = json!({
            "intelephense.files.associations": ["*.php", "*.blade.php"],
            "intelephense.environment.phpVersion": "8.2.0",
        });
        let merged = ensure_htm_indexed(Some(flat)).unwrap();
        assert_eq!(
            merged["intelephense.files.associations"],
            json!(["*.php", "*.blade.php", "*.htm"])
        );
        // Untouched, and no stray nested key invented alongside it.
        assert_eq!(merged["intelephense.environment.phpVersion"], json!("8.2.0"));
        assert!(merged.get("files").is_none());

        // Already present: no duplicate.
        let already = json!({ "files": { "associations": ["*.htm", "*.php"] } });
        assert_eq!(
            ensure_htm_indexed(Some(already)).unwrap()["files"]["associations"],
            json!(["*.htm", "*.php"])
        );

        assert!(ensure_htm_indexed(Some(json!("nope"))).is_err());
    }

    #[test]
    fn disables_language_constraints_unless_the_user_set_it() {
        let defaulted = ensure_htm_indexed(None).unwrap();
        assert_eq!(defaulted["diagnostics"]["languageConstraints"], json!(false));

        // Nested override respected.
        let nested = json!({ "diagnostics": { "languageConstraints": true } });
        assert_eq!(
            ensure_htm_indexed(Some(nested)).unwrap()["diagnostics"]["languageConstraints"],
            json!(true)
        );

        // Flat, VSCode-style override respected too.
        let flat = json!({ "intelephense.diagnostics.languageConstraints": true });
        let merged = ensure_htm_indexed(Some(flat)).unwrap();
        assert_eq!(
            merged["intelephense.diagnostics.languageConstraints"],
            json!(true)
        );
        assert!(merged.get("diagnostics").is_none());
    }

    #[test]
    fn every_declared_server_has_an_npm_source() {
        for id in [INTELEPHENSE, HTML, EMMET] {
            assert!(npm_source(id).is_some(), "{id} has no npm source");
        }
        assert!(npm_source("nonsense").is_none());
        // Twiggy was removed deliberately; see the module docs.
        assert!(npm_source("twiggy-language-server").is_none());
        // Ours is bundled, not installed, so it must not claim an npm source.
        assert!(npm_source(OCTOBER).is_none());
    }

    #[test]
    fn bundled_server_is_a_document_link_server() {
        assert!(
            OCTOBER_SERVER_JS.contains("documentLinkProvider"),
            "the bundled script does not advertise document links"
        );
        assert!(
            OCTOBER_SERVER_JS.contains("textDocument/documentLink"),
            "the bundled script does not answer documentLink"
        );
        assert!(
            !OCTOBER_SERVER_JS.contains("require('vscode-languageserver"),
            "the bundled script must stay dependency-free; there is no node_modules beside it"
        );
    }
}

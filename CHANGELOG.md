# Changelog

## [0.1.0] - 2026-08-12

Initial release.

### Added
- **Highlighting for all three sections of an October `.htm` template.** A host grammar
  (`tree-sitter-october`) splits the file by `==` separator position and delegates each
  chunk to its own grammar: `October INI`, `October PHP` (the tag-less `php_only` dialect,
  so `<?php` is optional), `October Twig`, and `October HTML` for the markup between Twig
  tags, which injects CSS and JavaScript in turn. Works with 0, 1 or 2 separators, and any
  section may be empty.

  All four injected languages are named `October …` and marked `hidden`, and the Twig and
  HTML grammars are vendored under their own names, because Zed resolves both languages and
  grammars by name in one global namespace — sharing a name with a standalone Twig, ini,
  HTML or Blade extension would make the winner depend on load order.

- **October's named tag parameters parse.** `{% partial 'footer' year=2026 %}` and
  `{% component 'x' k=1 %}` are not valid upstream Twig, so the `=` came through as an error
  node. The grammar is vendored at
  [`artistro08/tree-sitter-october`](https://github.com/artistro08/tree-sitter-october)
  under `twig/` with `tag_statement` accepting an optional `argument_name` before each
  expression. All 48 upstream corpus tests still pass.

- **Auto-indent.** Markup, PHP, CSS and JavaScript indent from each injected layer's own
  `indents.scm`. Twig block tags cannot: the grammar parses `{% if %}` and `{% endif %}` as
  unrelated siblings, so no node spans the block for a query to match.
  `increase_indent_pattern` / `decrease_indent_pattern` in `languages/october/config.toml`
  cover them, on the root language because that is where Zed reads them.

- **Twig delimiter autoclose.** Type `{%` then a space and you get `{% | %}` with the cursor
  in the middle, likewise `{{ }}` and `{# #}`. The space lives in the pair's `start`,
  because Zed fires a pair when the character you just typed is the last character of
  `start` and the buffer already holds the rest — so the space is the trigger.

- **Clickable partial links.** Cmd-click a `{% partial %}` or `{% content %}` reference, or
  the INI `layout` key, to open the file it names. Resolution follows October's rules:
  `.htm` is appended only when the reference lacks an extension, and anything the current
  theme does not have falls through the `parent:` chain in `theme.yaml`. A link appears only
  when the target exists, so an unstyled reference is a broken one.

  Component partials (`{% partial '@name' %}`) and runtime-computed names
  (`{% partial 'sections/' ~ type %}`) are left alone — the first needs a plugin's
  `registerComponents()` map out of PHP, the second cannot be resolved statically.

  This needs a language server. Zed's cmd-click runs on LSP `textDocument/documentLink`, its
  built-in path detection only tries the string relative to the worktree root and the file's
  own directory, and the extension API exposes no hook for producing links from wasm. The
  server is dependency-free Node, embedded in `extension.wasm` with `include_str!` and
  written back out at startup — the packager copies only a fixed allowlist of paths, so a
  `server/` directory would be dropped from a published build.

- **Language servers.** `intelephense` for the PHP section, `vscode-html-language-server`
  and `emmet-language-server` for the markup. Installed from npm on first use; a copy
  already on `PATH` is preferred. Each is registered under its canonical id, so existing
  `lsp: { intelephense: … }` settings apply unchanged.

  Zed attaches language servers per buffer, not per injected layer, so all three see the
  whole file. `language_ids` hands each the id of the section it cares about (`php`,
  `html`); without that they would receive `october cms` and do nothing.
  `scope_opt_in_language_servers` then stops Zed querying a server outside its section:
  nothing in the INI header, intelephense alone inside `<?php ?>`, HTML and Emmet in the
  markup.

- `intelephense.files.associations` includes `*.htm`. intelephense only indexes files
  matching that list, so without it the PHP section is never indexed. A user-supplied list
  is appended to rather than replaced, and both spellings are handled — the nested
  `files.associations` and the flat VSCode-style `"intelephense.files.associations"`.

- Bracket matching, comment and string scopes, PHP outline entries, and string/number
  highlighting for INI values.

### Not included
- **No Twig language server.** `twiggy-language-server` was tried and dropped. It reports
  `Unexpected syntax` on any node its parser rejects, and Zed hands it the whole buffer, so
  it flagged the INI header of every page that binds a route parameter
  (`pageNumber = "{{ :page }}"`) as well as October's named tag parameters. Neither is valid
  upstream Twig and the warning is not configurable — twiggy exposes only a `twigCsFixer`
  toggle. It could not resolve `{% partial %}` or `{% component %}` paths either, so it was
  a false-positive generator with nothing to offset it.

- **No Tailwind.** Zed registers `tailwindcss-language-server` against a fixed set of
  language names in core, which an extension cannot add to.

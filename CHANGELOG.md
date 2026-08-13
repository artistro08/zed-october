# Changelog

## [0.4.1] - 2026-08-12

### Changed
- **Twig delimiters autoclose with the spacing Twig is written in.** Type `{%` then a space
  and you get `{% | %}` with the cursor in the middle, likewise `{{ }}` and `{# #}`. The
  space lives in the pair's `start`, because Zed fires a pair when the character you just
  typed is the last character of `start` and the buffer already holds the rest — so the
  space is the trigger. The unspaced pair is gone rather than kept alongside: it matches on
  `%` first, and the space would then fire the spaced pair too, giving `{% | %} %}`.
- `autoclose_before` now includes `<`. Autoclose is gated on the character after the cursor;
  whitespace and end-of-line always pass, but without `<` the delimiters stayed closed when
  typing immediately before a tag.

## [0.4.0] - 2026-08-12

### Fixed
- **`{%` autoclosed to `{%}`.** Zed takes bracket pairs from the syntax layer under the
  cursor, and while you are typing `{%` the buffer still reads `{`, so that layer is the
  injected markup one, not Twig. Zed's stock HTML config offers `{` → `}` and no `{%`. The
  markup layer is now vendored as `October HTML` (`languages/october-html/`) with the Twig
  delimiters in its bracket list, so `{%`, `{{` and `{#` close correctly. This also drops
  the dependency on Zed's HTML extension being installed.

### Added
- **Language servers for each section.** `intelephense` for the PHP section, and
  `vscode-html-language-server` plus `emmet-language-server` for the markup. Installed from
  npm on first use; a copy already on `PATH` is preferred.

  Zed resolves language servers by language name and attaches them per buffer, so a server
  another extension registered for its own language cannot be borrowed — these have to be
  declared here, against `October CMS`, which is why the Rust crate is back. `language_ids`
  maps `October CMS` to the id each server expects (`php`, `html`); without that they would
  receive `october cms` and do nothing.

  All three therefore see the whole file. `scope_opt_in_language_servers` in the language
  configs stops Zed querying a server outside its section: nothing in the INI header,
  intelephense alone inside `<?php ?>`, HTML and Emmet in the markup.

- `intelephense.files.associations` now includes `*.htm`. intelephense only indexes files
  matching that list, so without it the PHP section was never indexed. A user-supplied list
  is appended to rather than replaced, and both spellings are handled — the nested
  `files.associations` and the flat VSCode-style `"intelephense.files.associations"`.

- Documented the October YAML schemas from the
  [October Code](https://github.com/SergeyKasyanov/vscode-october-extension) VSCode
  extension. Point Zed's own yaml-language-server at them for completion, hover docs and
  validation in `fields.yaml`, `columns.yaml`, `theme.yaml`, blueprints and the rest. They
  live in user settings, not here: a `.yaml` file is Zed's YAML language, and an extension
  can only configure servers it registers for its own language.

### Changed
- Emmet no longer requires patching the Emmet extension's own manifest — this extension
  registers `emmet-language-server` for `October CMS` itself. Revert any local patch to
  `extensions/installed/emmet/extension.toml`; leaving it in place registers the server
  twice for the same language.

### Not included
- **No Twig language server.** `twiggy-language-server` was tried and dropped. It reports
  `Unexpected syntax` on any node its parser rejects, and Zed hands it the whole buffer, so
  it flagged the INI header of every page that binds a route parameter
  (`pageNumber = "{{ :page }}"`) as well as October's named tag parameters
  (`{% partial 'footer' year=2026 %}`). Neither is valid upstream Twig and the warning is
  not configurable — twiggy exposes only a `twigCsFixer` toggle. It could not resolve
  `{% partial %}` or `{% component %}` paths either, so it was a false-positive generator
  with nothing to offset it.

## [0.3.0] - 2026-08-11

### Fixed
- **Twig and HTML highlighting did not work at all.** `languages/twig/injections.scm`
  referenced `style_content`, `js_content` and `json_content`, which do not exist in
  gbprod/tree-sitter-twig. A single bad node name fails the whole query, so Zed dropped
  the language and every `{% %}` tag, `{{ }}` output and HTML tag in the template section
  rendered as plain text. The HTML layer injects CSS and JavaScript for `<style>` and
  `<script>` on its own, so those blocks still highlight.
- **PHP section relied on an unrelated extension.** The section was injected as `php_only`,
  a language only registered by the Laravel Blade extension. Without Blade installed the
  entire PHP section was unhighlighted. The `php_only` grammar is now bundled here.
- **Language name collisions.** The bundled `Twig` and `INI` languages shared their names
  with the standalone Twig and ini extensions. Zed resolves an injection language by name,
  so which grammar won depended on extension load order. Renamed to `October Twig`,
  `October INI` and `October PHP`.
- Dropped the `@spell` captures on comments. Zed has no such highlight, and the second
  capture on the same node shadowed `@comment`.
- **October's named tag parameters errored.** `{% partial 'footer' year=2026 %}` and
  `{% component 'x' k=1 %}` are not valid upstream Twig, so the `=` parsed as an error
  node. The Twig grammar is now vendored in `artistro08/tree-sitter-october` under
  `twig/`, renamed to `october_twig` (Zed registers grammars in one global namespace, so
  the name `twig` collided with a standalone Twig extension) and with `tag_statement`
  accepting an optional `argument_name` before each expression. All 48 upstream corpus
  tests still pass.

### Added
- **Auto-indent.** New lines now indent like HTML. Indentation for markup, PHP, CSS and
  JavaScript comes from each injected layer; `increase_indent_pattern` /
  `decrease_indent_pattern` in `languages/october/config.toml` cover Twig block tags
  (`{% if %}` / `{% for %}` / `{% block %}` and friends), which tree-sitter cannot express
  because the Twig grammar parses openers and closers as unrelated siblings.
- Bracket matching and `{{ }}` / `{% %}` / `{# #}` autoclose in the template section.
- Comment and string scopes (`overrides.scm`), so quote autoclose stays out of comments
  and strings.
- INI setting values are now highlighted as strings.
- Outline entries for the PHP section.

### Changed
- Removed the Rust crate. The extension declares no language servers, so `src/lib.rs`
  only returned an error. Dropping it removes a ~90s build step from every reload.

## [0.1.0] - 2026-01-05

### Added
- **Initial release of October CMS syntax highlighting for Zed!**
- Full support for October CMS three-section template structure
- Syntax highlighting for all template variations:
  - ✅ Templates with all three sections (INI + PHP + Twig)
  - ✅ Templates with INI + Twig (no PHP)
  - ✅ Templates with PHP + Twig (no INI)
  - ✅ Templates with Twig only (pure HTML)

### Features
- **INI configuration section** - Key-value pairs and section headers with syntax highlighting
- **PHP code section** - Full PHP syntax highlighting between `<?php ?>` tags
- **Twig/HTML markup section** - Template syntax with HTML highlighting
- Section delimiter detection (`==`) using external scanner
- Language injection support for all three languages (INI, PHP, HTML)

### Technical Details
- Built on tree-sitter-twig as base grammar
- Uses tree-sitter-ini for INI configuration highlighting
- Uses tree-sitter-php's `php_only` dialect for embedded PHP
- Custom external scanner for `==` delimiter detection
- All sections use leaf tokens for proper Zed injection compatibility

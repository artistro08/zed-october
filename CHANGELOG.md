# Changelog

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

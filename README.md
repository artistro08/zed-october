# October CMS for Zed

Syntax highlighting for [October CMS](https://octobercms.com/) templates in the Zed editor.

## Features

- Full highlighting for all three October template sections:
  - **INI** configuration
  - **PHP** code (tagged `<?php ... ?>` or tagless — `==` alone marks the section)
  - **Twig** template markup, with HTML, CSS and JavaScript inside it
- Each section highlights independently — works whether the file has 0, 1, or 2 `==` separators
- Empty sections supported (file may start with `==` or have back-to-back `==` lines)
- Auto-indent: new lines indent like HTML, and Twig block tags (`{% if %}`, `{% for %}`,
  `{% block %}`, …) indent their bodies and outdent their `{% end… %}`
- Bracket matching and autoclose for `{{ }}`, `{% %}` and `{# #}`
- Language servers per section — PHP, HTML, Twig and Emmet — each scoped to the part of the
  template it understands (see [Language servers](#language-servers))
- Support for `.htm` template files

## Installation

1. Open Zed
2. Use Command Palette (`Cmd/Ctrl + Shift + P`)
3. Search for "Extensions"
4. Search for "October CMS"
5. Click Install

### Make `.htm` open as October CMS

Zed's HTML extension also claims the `.htm` suffix, and when two languages claim the same
suffix the winner depends on extension load order. If a template opens as HTML, pin it in
your Zed `settings.json`:

```json
{
  "file_types": {
    "October CMS": ["**/themes/**/*.htm"]
  }
}
```

Use `["htm"]` instead of the glob if every `.htm` file you edit is an October template.

No companion extension is needed. The HTML grammar and queries for the markup between Twig
tags are bundled here, so indentation, `<style>` / `<script>` highlighting and `{% %}`
autoclose all work on a fresh install.

## Language servers

Three servers run on a template, installed from npm on first use. Nothing else needs to be
installed, and no other extension needs to be patched.

| Server | Serves | npm package |
|---|---|---|
| `intelephense` | PHP section | `intelephense` |
| `vscode-html-language-server` | markup in the template section | `@zed-industries/vscode-langservers-extracted` |
| `emmet-language-server` | abbreviations in the template section | `@olrtg/emmet-language-server` |

If any of these is already on your `PATH`, that copy is used instead of a downloaded one.

### Why there is no Twig server

`twiggy-language-server` was tried and dropped. It reports `Unexpected syntax` on any node
its parser rejects, and Zed hands it the whole file, so it flagged two things that appear in
essentially every October project:

- route parameter bindings in the INI header — `pageNumber = "{{ :page }}"`
- named tag parameters — `{% partial 'footer' year=2026 %}`

Neither is valid upstream Twig. The warning is not configurable (twiggy exposes only a
`twigCsFixer` toggle), and it cannot resolve `{% partial %}` or `{% component %}` paths
either, so there was nothing to offset the false positives.

### How they are scoped

Zed attaches language servers per buffer, not per injected layer, so all four receive the
whole file. Each is handed the LSP language id of the section it cares about — the rest
degrades to inert text, since PHP treats anything outside `<?php ?>` as inline HTML and
Twig treats it as literal content.

On top of that, `scope_opt_in_language_servers` in each language config stops Zed asking a
server for completions where it does not belong:

| Cursor is in | Servers queried |
|---|---|
| INI header | none |
| `<?php … ?>` | `intelephense` |
| `{% … %}`, `{{ … }}` | none |
| markup between Twig tags | HTML, Emmet |

### Configuring or disabling one

Each server is registered under its canonical id, so existing settings apply unchanged:

```json
{
  "lsp": {
    "intelephense": { "settings": { "intelephense": { "licenceKey": "…" } } }
  }
}
```

`intelephense.files.associations` defaults to `["*.php", "*.phtml", "*.htm"]` here — without
`*.htm` intelephense would not index October templates at all. Setting your own list
replaces it, so keep `*.htm` in it.

To turn one off:

```json
{
  "languages": {
    "October CMS": { "language_servers": ["...", "!emmet-language-server"] }
  }
}
```

Tailwind is not in the list: Zed registers `tailwindcss-language-server` against a fixed set
of language names in core, which an extension cannot add to.

## October YAML schemas

`fields.yaml`, `columns.yaml`, `theme.yaml`, blueprints and the rest are ordinary YAML
files, so they are handled by Zed's own YAML language server rather than by this extension.
Point it at the JSON Schemas from the
[October Code](https://github.com/SergeyKasyanov/vscode-october-extension) VSCode extension
and you get completion, hover docs and validation for all of them:

```json
{
  "lsp": {
    "yaml-language-server": {
      "settings": {
        "yaml": {
          "schemas": {
            "https://raw.githubusercontent.com/SergeyKasyanov/vscode-october-extension/<commit>/resources/schemas/fields.yaml.json": ["**/*fields*.yaml"],
            "https://raw.githubusercontent.com/SergeyKasyanov/vscode-october-extension/<commit>/resources/schemas/columns.yaml.json": ["**/*columns*.yaml"],
            "https://raw.githubusercontent.com/SergeyKasyanov/vscode-october-extension/<commit>/resources/schemas/blueprint.yaml.json": ["**/blueprints/**/*.yaml"],
            "https://raw.githubusercontent.com/SergeyKasyanov/vscode-october-extension/<commit>/resources/schemas/config_form.yaml.json": ["**/*form*.yaml"],
            "https://raw.githubusercontent.com/SergeyKasyanov/vscode-october-extension/<commit>/resources/schemas/config_list.yaml.json": ["**/*list*.yaml"],
            "https://raw.githubusercontent.com/SergeyKasyanov/vscode-october-extension/<commit>/resources/schemas/theme.yaml.json": ["**/theme.yaml"],
            "https://raw.githubusercontent.com/SergeyKasyanov/vscode-october-extension/<commit>/resources/schemas/version.yaml.json": ["**/version.yaml"]
          }
        }
      }
    }
  }
}
```

Pin `<commit>` rather than using `main`, so the schemas cannot change underneath you. The
full set also covers `*groups*`, `*filter*`, `*relation*`, `*reorder*`, `*import_export*`
and theme seed data.

These have to live in your settings, not in this extension: a `.yaml` file is Zed's YAML
language, and an extension can only configure servers it registers for its own language.

## October CMS Template Structure

October CMS templates consist of up to three sections separated by `==`:

```
url = "/blog"
layout = "default"

[blogPosts]
postsPerPage = 10
==
<?php
function onStart()
{
    $this['posts'] = Post::all();
}
?>
==
<h1>{{ page.title }}</h1>
{% for post in posts %}
    {{ post.content }}
{% endfor %}
```

Section positions (when separators are present):

| Separators | Sections |
|---|---|
| 0 | Twig |
| 1 | INI, Twig |
| 2 | INI, PHP, Twig |

Any section may be empty. Tagless PHP (no `<?php`/`?>`) is supported — the `==` separators
alone delimit the PHP section.

## How it works

A small host grammar (`tree-sitter-october`) splits the file into chunks by position. Each
chunk is then delegated via Zed language injections to the right grammar:

| Chunk | Injected language | Grammar |
|---|---|---|
| INI | `October INI` | [justinmk/tree-sitter-ini](https://github.com/justinmk/tree-sitter-ini) |
| PHP | `October PHP` | [tree-sitter-php](https://github.com/tree-sitter/tree-sitter-php), `php_only` dialect |
| Twig | `October Twig` | [gbprod/tree-sitter-twig](https://github.com/gbprod/tree-sitter-twig), vendored as `october_twig` |
| markup inside Twig | `October HTML` | [tree-sitter-html](https://github.com/tree-sitter/tree-sitter-html), which injects CSS and JavaScript in turn |

The four injected languages are named `October …` and marked `hidden` so they never
collide with a standalone Twig, ini, HTML or Blade extension — Zed resolves an injection
language by name, and two languages sharing one name resolve in extension load order. The
Twig grammar is vendored under the name `october_twig` for the same reason: Zed registers
grammars in one global namespace too.

The markup layer is vendored rather than injecting Zed's stock `html` language because Zed
takes bracket pairs from the syntax layer under the cursor. While you are typing `{%` the
buffer still reads `{`, so that layer is still the markup one — the stock HTML config offers
`{` → `}` and no `{%`, which produced `{%}`. `languages/october-html/config.toml` is that
config with the Twig delimiters added.

That vendored copy also teaches the grammar October's named tag parameters —
`{% partial 'site/footer' year=2026 %}`, `{% component 'blogPosts' k=1 %}` — which are not
valid upstream Twig and used to parse the `=` as an error. See
[`twig/`](https://github.com/artistro08/tree-sitter-october/tree/main/twig).

## Credits

Based on:
- [tree-sitter-twig](https://github.com/gbprod/tree-sitter-twig) by gbprod
- [tree-sitter-ini](https://github.com/justinmk/tree-sitter-ini) by justinmk
- [tree-sitter-php](https://github.com/tree-sitter/tree-sitter-php)

## License

MIT License - Copyright (c) 2026 Devin Green (artistro08)

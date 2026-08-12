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

### Recommended companion

Install the **HTML** Zed extension. The template section injects it for the markup between
Twig tags, and it is what supplies HTML indentation and `<style>` / `<script>` highlighting.

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
| markup inside Twig | `html` | Zed's HTML extension, which injects CSS and JavaScript in turn |

The three injected languages are named `October …` and marked `hidden` so they never
collide with a standalone Twig, ini or Blade extension — Zed resolves an injection language
by name, and two languages sharing one name resolve in extension load order. The Twig
grammar is vendored under the name `october_twig` for the same reason: Zed registers
grammars in one global namespace too.

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

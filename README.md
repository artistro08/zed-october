# October CMS for Zed

Syntax highlighting for [October CMS](https://octobercms.com/) templates in the Zed editor.

## Features

- Full highlighting for all three October template sections:
  - **INI** configuration
  - **PHP** code (tagged `<?php ... ?>` or tagless — `==` alone marks the section)
  - **Twig** template markup
- Each section highlights independently — works whether the file has 0, 1, or 2 `==` separators
- Empty sections supported (file may start with `==` or have back-to-back `==` lines)
- Support for `.htm` template files

## Installation

1. Open Zed
2. Use Command Palette (`Cmd/Ctrl + Shift + P`)
3. Search for "Extensions"
4. Search for "October CMS"
5. Click Install

### Recommended companion

Install the **PHP** Zed extension for full PHP semantic features inside the PHP section.

## October CMS Template Structure

October CMS templates consist of up to three sections separated by `==`:

```
url = "/blog"
layout = "default"
==
function onStart() {
    $this['posts'] = Post::all();
}
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

Any section may be empty. Tagless PHP (no `<?php`/`?>`) is supported — the `==` separators alone delimit the PHP section.

## How it works

A small host grammar (`tree-sitter-october`) splits the file into chunks by position. Each chunk is then delegated via Zed language injections to the right grammar:

- INI chunk → `ini` grammar
- PHP chunk → `php_only` (tag-less PHP)
- Twig chunk → `twig` grammar (bundled, [gbprod/tree-sitter-twig](https://github.com/gbprod/tree-sitter-twig))

## Credits

Based on:
- [tree-sitter-twig](https://github.com/gbprod/tree-sitter-twig) by gbprod
- [tree-sitter-ini](https://github.com/justinmk/tree-sitter-ini) by justinmk

## License

MIT License - Copyright (c) 2026 Devin Green (artistro08)

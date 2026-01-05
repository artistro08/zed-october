# October CMS for Zed

Syntax highlighting for [October CMS](https://octobercms.com/) templates in the Zed editor.

## Features

- Full Twig syntax highlighting (October CMS is based on Twig)
- Support for `.htm` template files
- Future: INI configuration section highlighting
- Future: PHP code section highlighting

## Installation

1. Open Zed
2. Use Command Palette (`Cmd/Ctrl + Shift + P`)
3. Search for "Extensions"
4. Search for "October CMS"
5. Click Install

## October CMS Template Structure

October CMS templates consist of up to three sections separated by `==`:

```
url = "/blog"
layout = "default"
==
<?php
function onStart() {
    $this['posts'] = Post::all();
}
?>
==
<h1>{{ page.title }}</h1>
{% for post in posts %}
    {{ post.content }}
{% endfor %}
```

Currently, the Twig markup section has full highlighting support. INI and PHP section support coming soon.

## Credits

Based on:
- [tree-sitter-twig](https://github.com/gbprod/tree-sitter-twig) by gbprod
- [zed-twig](https://github.com/YussufSassi/zed-twig) by Yussuf Sassi

## License

MIT License - Copyright (c) 2026 Devin Green (artistro08)

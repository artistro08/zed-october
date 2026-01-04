# October CMS Extension for Zed

This extension provides October CMS template language support for the [Zed editor](https://zed.dev).

## Features

- **Syntax Highlighting**: Full syntax highlighting for October CMS templates
- **Code Folding**: Fold Twig blocks and other structures
- **Bracket Matching**: Automatic matching of Twig delimiters and brackets
- **Auto-Indentation**: Smart indentation for Twig templates
- **Comment Toggling**: Quick comment/uncomment with `Cmd+/`

## October CMS Template Support

This extension recognizes `.htm` files and provides language support for:

### Configuration Section (INI)
```
url = "/blog"
layout = "default"
[component]
param = "value"
```

### PHP Code Section
```php
<?php
function onStart() {
    $this['posts'] = Post::all();
}
?>
```

### Twig Markup Section
```twig
<h1>{{ page.title }}</h1>
{% for post in posts %}
    <article>{{ post.title }}</article>
{% endfor %}
```

## Supported October CMS Tags

- `{% page %}` - Renders the page content
- `{% partial 'name' %}` - Includes a partial
- `{% ajaxPartial 'name' %}` - Includes an AJAX partial
- `{% component 'name' %}` - Renders a component
- `{% content 'name' %}` - Renders a content block
- `{% placeholder 'name' %}` - Defines a placeholder
- `{% flash %}` - Displays flash messages

## Installation

### From Source

1. Clone this repository
2. Build the extension:
   ```bash
   cd zed-october
   cargo build --release
   ```
3. Link the extension to Zed:
   ```bash
   mkdir -p ~/.config/zed/extensions
   ln -s $(pwd) ~/.config/zed/extensions/october
   ```

### From Zed Extensions (Coming Soon)

Once published to the Zed extensions repository, you'll be able to install directly from Zed:

1. Open Zed
2. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Linux/Windows)
3. Search for "Extensions: Install Extension"
4. Search for "October CMS"
5. Click Install

## Development

### Prerequisites

- Rust toolchain
- Zed editor

### Building

```bash
cargo build --release
```

### Testing Locally

1. Build the extension
2. Create a symbolic link in Zed's extensions directory:
   ```bash
   mkdir -p ~/.config/zed/extensions
   ln -s /path/to/zed-october ~/.config/zed/extensions/october
   ```
3. Restart Zed or reload the window
4. Open an October CMS `.htm` file

## Tree-sitter Grammar

This extension uses the [tree-sitter-october](../tree-sitter-october) grammar. See that repository for details on the grammar implementation.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Resources

- [October CMS Documentation](https://octobercms.com/docs)
- [Zed Extension Documentation](https://zed.dev/docs/extensions)
- [Tree-sitter Documentation](https://tree-sitter.github.io/)

## License

MIT License - see LICENSE file for details

## Credits

- Based on the Twig tree-sitter grammar
- Developed for the October CMS community

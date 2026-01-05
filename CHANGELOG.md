# Changelog

## [0.1.0] - 2026-01-05

### Added
- Initial October CMS extension for Zed
- Full Twig syntax highlighting for `.htm` files
- Bracket matching and auto-closing
- Based on proven tree-sitter-twig and zed-twig implementations

### Fixed
- Regenerated parser to export `tree_sitter_october()` symbol (commit c8cc98d)
- Fixed Zed compilation error: "symbol exported via --export not found"

### Known Limitations
- INI configuration section not yet supported
- PHP code section not yet supported
- Section delimiter (`==`) not yet recognized
- Treats entire file as Twig template

### Credits
- Based on [tree-sitter-twig](https://github.com/gbprod/tree-sitter-twig) by gbprod
- Based on [zed-twig](https://github.com/YussufSassi/zed-twig) by Yussuf Sassi

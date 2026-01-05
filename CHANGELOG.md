# Changelog

## [0.2.0] - 2026-01-05

### Added
- **Full October CMS three-section template support** (commit ac09bdd)
  - INI configuration section parsing with key-value pairs and section headers
  - PHP code section parsing with optional `<?php ?>` tags
  - Section delimiter (`==`) recognition
  - Support for all combinations of optional sections
- Syntax highlighting for INI configuration section
- Syntax highlighting for PHP code section
- Syntax highlighting for section delimiters

### Changed
- Grammar now properly parses October CMS template structure
- Templates can have INI-only, PHP-only, Twig-only, or any combination

## [0.1.0] - 2026-01-05

### Added
- Initial October CMS extension for Zed
- Full Twig syntax highlighting for `.htm` files
- Bracket matching and auto-closing
- Based on proven tree-sitter-twig and zed-twig implementations

### Fixed
- Regenerated parser to export `tree_sitter_october()` symbol (commit c8cc98d)
- Fixed Zed compilation error: "symbol exported via --export not found"

### Credits
- Based on [tree-sitter-twig](https://github.com/gbprod/tree-sitter-twig) by gbprod
- Based on [zed-twig](https://github.com/YussufSassi/zed-twig) by Yussuf Sassi

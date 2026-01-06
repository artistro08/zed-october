# Changelog

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

# Changelog

## [0.3.0] - 2026-01-05

### Added
- ✅ **Full working section recognition for all October CMS template types!**
- INI configuration section with support for:
  - Key-value pairs
  - Section headers `[section]`
  - Array-style keys `key[index] = value`
- PHP code section with `<?php ?>` tag recognition
- Twig markup section with complete syntax highlighting
- Section delimiter (`==`) detection via external C scanner

### Changed
- Redesigned `content` rule to explicitly exclude PHP tags and section delimiters
- Applied aggressive precedence (prec 100) to section rules
- Made content rule token-based with very low precedence (-100) as last resort
- Re-enabled newlines in extras for proper whitespace handling

### Fixed
- **Section recognition now works correctly!** All three sections parse properly
- HTML content in Twig sections now highlights correctly
- INI settings with array keys (e.g., `localeUrl[en]`) now parse correctly

## [0.2.1] - 2026-01-05

### Added
- External scanner in C for improved section delimiter recognition
- Grammar infrastructure for INI and PHP section support
- Highlighting queries for all three October CMS sections

### Changed
- Switched to external scanner for section delimiter detection
- Simplified grammar structure for better maintainability

### Known Limitations (RESOLVED in v0.3.0)
- ~~Section recognition (INI and PHP) is still in development~~
- ~~Currently provides excellent Twig syntax highlighting~~
- ~~Full multi-section template parsing coming in future releases~~

## [0.2.0] - 2026-01-05

### Added
- **Attempted October CMS three-section template support**
  - Grammar rules for INI configuration, PHP code, and Twig sections
  - Section delimiter (`==`) patterns
  - Highlighting queries for all sections

### Known Issues
- Section recognition not fully functional (reverted to Twig-only for stability)

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

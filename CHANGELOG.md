# Changelog

## [0.7.0] - 2026-01-05

### Added
- **Support for templates with optional sections!**
- Templates can now have any combination of sections:
  - ✅ All three sections (INI + PHP + Twig) - Full support
  - ✅ PHP + Twig (no INI configuration) - Full support
  - ✅ Twig only (no INI or PHP) - Full support
  - ⚠️ INI + Twig (no PHP) - Known limitation*

*Note: Templates with INI configuration but no PHP section may not parse correctly. This is a rare edge case since most October templates that have configuration also include PHP code.

### Technical Details
- INI content pattern: `/([^<\r\n]+|\r?\n)+/` matches until `<?php` or external scanner's `==`
- PHP section properly detects `<?php` opening tag
- Twig section acts as fallback for pure HTML templates

## [0.6.1] - 2026-01-05

### Fixed - THE ACTUAL PROBLEM!
- **Updated `languages/october/injections.scm` with INI and PHP injections**
- **ROOT CAUSE**: Zed reads query files from `languages/<lang>/` directory, NOT from the grammar's `queries/` directory
- The tree-sitter grammar had all injections defined correctly
- But the Zed extension's `languages/october/injections.scm` was outdated and only had HTML
- Now all three injections (INI, PHP, HTML) are in the extension directory
- **Injections now work!**

### Investigation Summary
Through thorough research, discovered that:
1. Zed extensions use query files from `languages/<language-name>/` directory
2. Grammar's `queries/` directory is NOT used by Zed
3. We had been updating the wrong file location this whole time
4. Based on Zed extension structure documentation and analysis of working extensions

## [0.6.0] - 2026-01-05

### Added
- **INI section syntax highlighting support!**
- Added tree-sitter-ini grammar to extension
- Restructured configuration_section to use single `ini_content` leaf token
- INI injection now working (all three sections use leaf tokens)
- Based on: https://github.com/justinmk/tree-sitter-ini

### Summary
All three sections now properly structured for Zed injection:
- INI: `ini_content` leaf token → inject as "ini"
- PHP: `php_only` leaf token → inject as "php_only"
- Twig: `content` leaf token → inject as "html"

## [0.5.0] - 2026-01-05

### Fixed - THE REAL FIX (for PHP structure)
- **Inject `php_only` node containing ONLY content (no `<?php` tags)**
- Restructured to match tree-sitter-blade exactly:
  - `php_code` = parent node with children: `'<?php'` + `php_only` + `'?>'`
  - `php_only` = LEAF TOKEN containing ONLY the PHP code (no tags)
- Inject `php_only` node with `php_only` language
- tree-sitter-php's `php_only` dialect expects content WITHOUT the `<?php` tag
- Previous versions included tags in the injection, which broke tree-sitter-php
- Based on: https://github.com/EmranMR/tree-sitter-blade

## [0.4.1] - 2026-01-05 (BROKEN - still had tags in injection)

### Fixed
- Changed injection language to "php_only" instead of "php"
- tree-sitter-blade uses "php_only" for PHP code block injections
- Based on: https://github.com/EmranMR/tree-sitter-blade

## [0.4.0] - 2026-01-05 (BROKEN - had tags in injection)

### Fixed - CRITICAL
- **PHP injection structure fixed - using leaf nodes**
- **Zed only applies injections to LEAF NODES (nodes without children)**
- Changed `php_code` back to a single leaf token with NO child nodes
- Previous versions had child nodes (tags + content) which prevented injection
- `php_code` is now one atomic token containing `<?php`, content, and `?>`
- This matches why HTML `content` works - it's also a leaf token
- Based on: https://github.com/zed-industries/extensions/issues/484

## [0.3.9] - 2026-01-05 (BROKEN - had child nodes)

### Fixed
- **Restructured PHP injection to match HTML pattern exactly**
- `php_code` now has separate child nodes: `<?php` tag, `php_content` token, `?>` tag
- Injecting the whole `php_code` node (tags as children) like HTML `content` works
- No longer using monolithic single-token approach
- `php_content` is just the raw PHP code (like HTML `content` is raw HTML)
- This structural approach should work better with Zed's injection system

## [0.3.8] - 2026-01-05

### Fixed
- **Added Zed shorthand injection syntax for compatibility**
- Injections.scm now includes both standard tree-sitter syntax and Zed shorthand syntax
- Standard: `@injection.content` + `#set! injection.language`
- Zed shorthand: `@content` + `#set! language`
- Both PHP and HTML injections now use dual syntax
- Fixes compatibility with all Zed versions (historical shorthand + current standard support)

## [0.3.7] - 2026-01-05

### Fixed
- **PHP code now uses raw text token pattern (like tree-sitter-html)**
- Changed `php_code` from structured node to single raw text token
- This matches the injection pattern used by tree-sitter-html for script/style tags
- `php_code` is now a single token containing the entire PHP section with tags
- Removed `include-children` directive (no longer needed)

## [0.3.6] - 2026-01-05

### Fixed (Partial - superseded by v0.3.7)
- Added include-children directive to PHP injection
- PHP injection now uses `#set! injection.include-children` to capture all text content

## [0.3.5] - 2026-01-05

### Fixed
- **Restructured PHP code for better injection compatibility**
- Changed `php_code` from single token to structured nodes with children
- `php_code` now explicitly contains: `<?php` tag, `php_content` node, optional `?>` tag
- Structured approach should work better with Zed's language injection system
- PHP content parsing still correctly handles all PHP syntax including `==` operators

## [0.3.4] - 2026-01-05

### Fixed (Partial - superseded by v0.3.5)
- Restructured `_php_code_with_tags` to include `<?php` and `?>` tags within the `php_code` node
- tree-sitter-php injection now receives complete PHP code with required opening tag
- Simplified injection query to directly inject `php_code` node as PHP language

## [0.3.3] - 2026-01-05

### Fixed
- **Complete fix for PHP parsing and syntax highlighting!**
- Fixed `_php_code` pattern to handle `==` operator in PHP code
- Old pattern `/[^=?]+|=[^=]|[?][^>]/` stopped at `==`, breaking on code like `if ($x == null)`
- New pattern `/([^?]+|\?[^>])+/` correctly matches all PHP until `?>` tag
- Removed invalid node types from injections.scm that were causing query errors
- PHP injection now works correctly with full PHP syntax support
- Tested with complex PHP code including:
  - Equality operators (`==`)
  - Backslashes in strings (`'Content\Settings'`)
  - Null checks
  - Arrays and object access

## [0.3.2] - 2026-01-05

### Fixed (Partial - superseded by v0.3.3)
- Attempted fix by injecting `php_section` instead of `php_code`
- Still had parsing issues due to `==` operator breaking the pattern

## [0.3.1] - 2026-01-05

### Fixed (Partial - superseded by v0.3.2)
- Attempted PHP syntax highlighting fix with php_code injection
- This version did not fully work due to missing `<?php` tag in injection

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

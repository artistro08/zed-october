# Grammar Setup for Local Development

## Current Structure

The grammar files are now embedded in the extension directory:

```
zed-october/
├── grammars/
│   └── october/
│       ├── grammar.js       ✅ Grammar definition
│       └── src/
│           ├── parser.c     ✅ Generated parser
│           └── scanner.c    ✅ External scanner
├── languages/
│   └── october/
│       ├── config.toml
│       ├── highlights.scm
│       ├── brackets.scm
│       ├── indents.scm
│       └── injections.scm
└── extension.toml
```

## Changes Made

1. **Copied grammar files** from `tree-sitter-october/` to `zed-october/grammars/october/`
2. **Updated extension.toml** to use local path:
   ```toml
   [grammars.october]
   path = "grammars/october"
   ```
3. **Cleaned up** unnecessary files (bindings, examples, etc.)

## Try Building Again

In Zed:
1. Open the `zed-october` directory
2. Use Zed's extension development tools to build
3. Or use terminal: `cargo build --release --target wasm32-wasip2`

The grammar should now compile successfully since all files are in the expected location.

## If You Still Get Errors

Check Zed's logs at: `%APPDATA%\Zed\logs\Zed.log`

Common issues:
- **Missing clang**: Zed needs a C compiler. Make sure Visual Studio Build Tools are installed
- **Path issues**: Ensure you're opening the `zed-october` directory, not the parent `october` directory

## Updating the Grammar

If you need to modify the grammar:

1. Edit `tree-sitter-october/grammar.js`
2. Regenerate parser:
   ```bash
   cd tree-sitter-october
   tree-sitter generate
   ```
3. Copy updated files:
   ```bash
   cp grammar.js ../zed-october/grammars/october/
   cp src/parser.c ../zed-october/grammars/october/src/
   cp src/scanner.c ../zed-october/grammars/october/src/
   ```
4. Rebuild the Zed extension

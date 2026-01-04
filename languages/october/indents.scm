; Indentation for October CMS templates

; Increase indent for block-starting statements
(statement_directive
  (if_statement)) @indent

(statement_directive
  (for_statement)) @indent

(statement_directive
  (block_statement)) @indent

(statement_directive
  (macro_statement)) @indent

(statement_directive
  (filter_statement)) @indent

(statement_directive
  (auto_escape_statement)) @indent

(statement_directive
  (verbatim_statement)) @indent

(statement_directive
  (apply_statement)) @indent

(statement_directive
  (embed_statement)) @indent

; Increase indent for data structures
(array) @indent
(hash) @indent

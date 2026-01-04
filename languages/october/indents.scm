; Indentation for October CMS templates

; Increase indent for block-starting statements
[
  (if_statement)
  (for_statement)
  (block_statement)
  (macro_statement)
  (filter_statement)
  (auto_escape_statement)
  (verbatim_statement)
  (apply_statement)
  (embed_statement)
] @indent

; Increase indent for data structures
(array) @indent
(hash) @indent

; Dedent on closing keywords
(generic_statement
  tag: (
    _ @dedent
    (#match? @dedent "^end")
  ))

(generic_statement
  tag: (
    _ @dedent
    (#match? @dedent "^(else|elseif)$")
  ))

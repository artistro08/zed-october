; Scopes for the `not_in` clauses in config.toml, so quote autoclose stays out
; of comments and strings.
(comment) @comment.inclusive

[
  (string)
  (interpolated_string)
] @string

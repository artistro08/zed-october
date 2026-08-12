(section_name
  (text) @type) ; consistency with toml

(comment) @comment

[
  "["
  "]"
] @punctuation.bracket

"=" @operator

(setting
  (setting_name) @property)

; The grammar gives values no subtypes, so match on the text. Order matters:
; the numeric pattern must come after the catch-all to win.
(setting_value) @string

((setting_value) @number
  (#match? @number "^\\s*-?[0-9]+(\\.[0-9]+)?\\s*$"))

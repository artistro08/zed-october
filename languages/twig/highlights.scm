(comment) @comment

; Tag names: `if`, `for`, `set`, `endif`, plus October's `partial`,
; `component`, `placeholder`, `scripts`, `styles`, `put`, `framework`, ...
(keyword) @keyword

(conditional) @keyword

(repeat) @keyword

(tag) @keyword

(attribute) @keyword

(filter_identifier) @function

(function_identifier) @function

(method) @function

(test) @function

(variable) @variable

(parameter) @variable.parameter

(argument_name) @variable.parameter

(name) @property

(string) @string

(interpolated_string) @string

(number) @number

(boolean) @boolean

(null) @constant

(operator) @operator

[
  "{{"
  "}}"
  "{{-"
  "-}}"
  "{{~"
  "~}}"
  "{%"
  "%}"
  "{%-"
  "-%}"
  "{%~"
  "~%}"
] @tag.delimiter

[
  ","
  "."
] @punctuation.delimiter

[
  "?"
  ":"
  "="
  "|"
  "=>"
] @operator

(interpolated_string
  [
    "#{"
    "}"
  ] @punctuation.special)

[
  "("
  ")"
  "["
  "]"
] @punctuation.bracket

(hash
  [
    "{"
    "}"
  ] @punctuation.bracket)

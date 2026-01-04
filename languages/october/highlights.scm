; Highlighting for October CMS templates

; ===== Configuration Section (INI) =====
(ini_section_header) @type
(ini_key) @property
(ini_value) @string
(comment_line) @comment

; Section separators
(section_separator) @punctuation.special

; ===== PHP Section =====
(php_code) @embedded

; ===== Twig Section =====

; HTML Content
(content) @none

; Comments
(comment) @comment

; Delimiters
"{%" @punctuation.bracket
"%}" @punctuation.bracket
"{{" @punctuation.bracket
"}}" @punctuation.bracket
"{#" @punctuation.bracket
"#}" @punctuation.bracket

; Keywords and Control Flow
[
  "set"
  "if"
  "elseif"
  "else"
  "endif"
  "for"
  "endfor"
  "in"
  "block"
  "endblock"
  "macro"
  "endmacro"
  "import"
  "from"
  "filter"
  "endfilter"
  "autoescape"
  "endautoescape"
  "do"
  "flush"
  "verbatim"
  "endverbatim"
  "apply"
  "endapply"
  "embed"
  "endembed"
  "use"
  "end"
  "endset"
] @keyword

; October CMS specific tags
[
  "page"
  "partial"
  "ajaxPartial"
  "component"
  "content"
  "placeholder"
  "flash"
] @keyword.special

; Operators
[
  "or"
  "and"
  "not"
  "in"
  "is"
  "=="
  "!="
  "<"
  ">"
  "<="
  ">="
  "+"
  "-"
  "*"
  "/"
  "//"
  "%"
  "**"
  "~"
  "??"
  ".."
  "b-and"
  "b-or"
  "b-xor"
  "matches"
  "starts with"
  "ends with"
  "not in"
] @operator

; Punctuation
[":" "," "." "|"] @punctuation.delimiter
["(" ")" "[" "]" "{" "}"] @punctuation.bracket
["?" "="] @operator

; Literals
(string) @string
(number) @number
(boolean) @boolean
(null) @constant.builtin

; String interpolation
(interpolation
  "#{" @punctuation.special
  "}" @punctuation.special)

; Identifiers and Variables
(identifier) @variable

; Function calls
(function_call
  function: (identifier) @function)

; Filter expressions
(filter_expression
  filter: (identifier) @function.builtin)

; Test expressions
(test_expression
  test: (identifier) @function.builtin)

; Member access
(member_expression
  property: (identifier) @property)

; Hash keys
(hash_entry
  key: (identifier) @property)

; Named arguments
(named_argument
  name: (identifier) @parameter)

; Statement fields
(set_statement
  variable: (identifier) @variable)

(for_statement
  variable: (identifier) @variable)

(block_statement
  name: (identifier) @label)

(macro_statement
  name: (identifier) @function)

(placeholder_statement
  name: (identifier) @label)

(flash_statement
  type: (identifier) @type)

; Generic statement tags
(generic_statement
  tag: _ @keyword)

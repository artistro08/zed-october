; October CMS Template Highlighting

; ===== Configuration Section (INI) =====
(ini_section_header) @type
(ini_key) @property
(ini_value) @string
(comment_line) @comment
(section_separator) @punctuation.special

; ===== PHP Section =====
(php_code) @embedded

; ===== Twig Section =====

; Twig Comments
(comment) @comment

; Twig Delimiters - these are literal tokens
"{%" @punctuation.bracket
"%}" @punctuation.bracket
"{{" @punctuation.bracket
"}}" @punctuation.bracket
"{#" @punctuation.bracket
"#}" @punctuation.bracket

; Twig Directives
(statement_directive) @keyword
(output_directive) @variable

; Literals
(string) @string
(number) @number
(boolean) @constant.builtin
(null) @constant.builtin

; Identifiers
(identifier) @variable

; Function calls
(function_call
  function: (identifier) @function)

; Member expressions
(member_expression
  property: (identifier) @property)

; Filter expressions
(filter_expression
  "|" @operator
  filter: (identifier) @function.builtin)

; Binary operators
(binary_expression
  operator: _ @operator)

; Unary operators
(unary_expression
  operator: _ @operator)

; Arrays and hashes
(array
  "[" @punctuation.bracket
  "]" @punctuation.bracket)

(hash
  "{" @punctuation.bracket
  "}" @punctuation.bracket)

(hash_entry
  key: (identifier) @property)

; Parentheses
"(" @punctuation.bracket
")" @punctuation.bracket

; Other punctuation
":" @punctuation.delimiter
"," @punctuation.delimiter
"." @punctuation.delimiter
"|" @punctuation.delimiter
"=" @operator
"?" @operator

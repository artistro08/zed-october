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

; Statement types
(set_statement) @keyword
(if_statement) @keyword
(for_statement) @keyword
(block_statement) @keyword
(macro_statement) @keyword
(import_statement) @keyword
(from_statement) @keyword
(filter_statement) @keyword
(auto_escape_statement) @keyword
(do_statement) @keyword
(flush_statement) @keyword
(verbatim_statement) @keyword
(apply_statement) @keyword
(embed_statement) @keyword
(use_statement) @keyword

; October CMS specific statements
(page_statement) @keyword.special
(partial_statement) @keyword.special
(component_statement) @keyword.special
(content_statement) @keyword.special
(placeholder_statement) @keyword.special
(flash_statement) @keyword.special

; Generic statements
(generic_statement) @keyword

; Operators (binary and unary expressions)
(binary_expression) @operator
(unary_expression) @operator

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

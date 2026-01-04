; Bracket pairs for October CMS templates

; Twig delimiters
("{%" @open "%}" @close)
("{{" @open "}}" @close)
("{#" @open "#}" @close)

; Standard brackets
("(" @open ")" @close)
("[" @open "]" @close)
("{" @open "}" @close)

; INI section headers
(ini_section_header
  "[" @open
  "]" @close)

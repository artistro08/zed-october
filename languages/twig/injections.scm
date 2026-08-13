; Everything between Twig tags is markup. The HTML layer takes it from here and
; injects CSS/JavaScript for <style>/<script> itself, so this file must not
; reference style_content/js_content/json_content - gbprod/tree-sitter-twig has
; no such nodes, and one bad node name fails the whole query, which drops the
; language.
((content) @injection.content
  (#set! injection.language "October HTML")
  (#set! injection.combined))

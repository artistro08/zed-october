; INI configuration section
((ini_content) @injection.content
  (#set! injection.language "ini")
  (#set! injection.combined))

; PHP code section - inject as php_only (tag-less PHP dialect)
((php_content) @injection.content
  (#set! injection.language "php_only")
  (#set! injection.combined))

; Twig template section
((twig_content) @injection.content
  (#set! injection.language "twig")
  (#set! injection.combined))

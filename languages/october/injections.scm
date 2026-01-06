; INI configuration section injection
((ini_content) @injection.content
  (#set! injection.language "ini"))

; PHP code injection - inject only the content (no <?php tags)
; php_only node contains just the PHP code, matching tree-sitter-blade approach
((php_only) @injection.content
  (#set! injection.language "php_only"))

; HTML content in Twig section
((content) @injection.content
 (#set! injection.language "html")
 (#set! injection.combined))

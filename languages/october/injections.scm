; Language injections for October CMS templates

; Inject PHP into the PHP section
(php_section
  (php_code) @injection.content
  (#set! injection.language "php"))

; Inject Twig/HTML into the Twig section (content nodes)
(content) @injection.content
(#set! injection.language "html")

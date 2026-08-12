; INI configuration section
((ini_content) @injection.content
  (#set! injection.language "October INI")
  (#set! injection.combined))

; PHP code section - tag-less PHP dialect, so `<?php` is optional
((php_content) @injection.content
  (#set! injection.language "October PHP")
  (#set! injection.combined))

; Twig template section
((twig_content) @injection.content
  (#set! injection.language "October Twig")
  (#set! injection.combined))

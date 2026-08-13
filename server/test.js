#!/usr/bin/env node
'use strict';

// Self-check for the document-link server. Builds a throwaway two-theme layout
// on disk - a child theme with `parent:` set - because the resolution rules
// that actually break are the ones involving the parent chain and the optional
// `.htm`, and neither can be exercised without real files.
//
//     node server/test.js

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const url = require('url');

const { documentLinks, themeRoot, themeChain } = require('./october-language-server.js');

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'october-ls-'));
const child = path.join(root, 'themes', 'child');
const parent = path.join(root, 'themes', 'base');

const write = (file, body = '') => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, body);
};

write(path.join(child, 'theme.yaml'), "name: 'Child'\nparent: base\n");
write(path.join(parent, 'theme.yaml'), "name: 'Base'\n");
write(path.join(child, 'partials', 'header.htm'));
write(path.join(child, 'partials', 'account', 'sidebar.htm'));
write(path.join(child, 'partials', 'account', 'initial_meeting.htm'));
write(path.join(parent, 'partials', 'blog', 'header.htm'));
write(path.join(child, 'content', 'contact.htm'));
write(path.join(child, 'layouts', 'default.htm'));
write(path.join(child, 'assets', 'css', 'styles.css'));
write(path.join(child, 'assets', 'img', 'logo-2.svg'));
write(path.join(parent, 'assets', 'js', 'vendor.js'));
write(path.join(child, 'pages', 'account', 'login.htm'));

const page = path.join(child, 'pages', 'home.htm');
write(page);

const template = [
  'title = "Home"',
  'layout = "default"',
  '',
  '[blogPosts]',
  'postsPerPage = 10',
  '==',
  'function onStart() { $layout = "not-a-layout"; }',
  '==',
  "{% partial 'header' %}",                          // child theme
  "{% partial 'blog/header' post = post %}",         // parent theme fallback
  "{% partial 'account/initial_meeting.htm' %}",     // extension already present
  '{% partial "account/sidebar" %}',                 // double quotes
  "{%- partial 'header' -%}",                        // whitespace control
  "{% content 'contact.htm' %}",
  "{% partial 'does/not/exist' %}",                  // unresolvable
  "{% partial '@form-select-state' %}",              // component partial, skipped
  "{% partial '../../../etc/passwd' %}",             // traversal, refused
  "{{ 'assets/css/styles.css'|theme }}",             // theme asset
  "{{ 'assets/img/logo-2.svg' | theme }}",           // spaces around the pipe
  "{{ 'assets/js/vendor.js'|theme }}",               // parent theme fallback
  "{{ 'account/login'|page }}",                      // page
  "{{ 'assets/css/missing.css'|theme }}",            // unresolvable
  '{{ post.image|media|resize(300) }}',              // variable, not a literal
  '{{ item.page|link }}',                            // `.page` property, not the filter
  "{{ '/'|app }}",                                   // a URL base, names no file
  '',
].join('\n');

const links = documentLinks(template, page);
const targets = links.map((l) => url.fileURLToPath(l.target));
const tooltips = links.map((l) => l.tooltip).sort();

const rel = (p) => path.relative(root, p).split(path.sep).join('/');
console.log('resolved:');
for (const l of links) console.log(`  ${l.tooltip}  @ line ${l.range.start.line + 1}`);

// --- resolution -------------------------------------------------------------
assert.deepStrictEqual(tooltips, [
  'base/assets/js/vendor.js',
  'base/partials/blog/header.htm',
  'child/assets/css/styles.css',
  'child/assets/img/logo-2.svg',
  'child/content/contact.htm',
  'child/layouts/default.htm',
  'child/pages/account/login.htm',
  'child/partials/account/initial_meeting.htm',
  'child/partials/account/sidebar.htm',
  'child/partials/header.htm',
  'child/partials/header.htm',
], 'unexpected set of resolved links');

// `|theme` paths are theme-root relative and bring their own extension, so
// nothing may be appended to them.
assert.ok(
  tooltips.includes('child/assets/css/styles.css'),
  'a |theme asset resolves relative to the theme root',
);
assert.ok(
  !tooltips.some((t) => t.endsWith('.css.htm') || t.endsWith('.svg.htm') || t.endsWith('.js.htm')),
  '.htm must not be appended to an asset that already has an extension',
);
assert.ok(
  tooltips.includes('base/assets/js/vendor.js'),
  'assets fall through to the parent theme too',
);
// A property named `page` piped to something else is not the `|page` filter.
assert.ok(
  !links.some((l) => l.tooltip.includes('link')),
  'item.page|link must not be treated as a page reference',
);
assert.ok(
  !tooltips.some((t) => t.includes('missing.css')),
  'an asset that does not exist produces no link',
);

assert.ok(
  targets.some((t) => rel(t) === 'themes/base/partials/blog/header.htm'),
  'a partial missing from the child theme must fall through to the parent',
);
assert.ok(
  !targets.some((t) => t.includes('passwd')),
  'path traversal must not resolve',
);
assert.ok(
  !tooltips.some((t) => t.includes('form-select')),
  '@-prefixed component partials are deliberately not resolved',
);
assert.ok(
  !tooltips.some((t) => t.includes('does/not/exist')),
  'unresolvable references must not produce a link',
);

// --- ranges -----------------------------------------------------------------
// A range that is off by even one character underlines the wrong text, so check
// the reported span actually covers the name in the source.
const lines = template.split('\n');
for (const link of links) {
  const { start, end } = link.range;
  assert.strictEqual(start.line, end.line, 'links never span lines');
  const covered = lines[start.line].slice(start.character, end.character);
  assert.ok(
    lines[start.line].includes(`'${covered}'`) || lines[start.line].includes(`"${covered}"`),
    `range on line ${start.line + 1} covers ${JSON.stringify(covered)}, which is not a quoted name`,
  );
  const expected = path.posix.basename(covered) + (path.extname(covered) ? '' : '.htm');
  assert.ok(
    link.tooltip.endsWith(expected),
    `link for ${JSON.stringify(covered)} points at ${link.tooltip}, expected it to end with ${expected}`,
  );
}

// `layout = "default"` in the INI header links; the same text in the PHP
// section is a variable assignment and must not.
const layoutLinks = links.filter((l) => l.tooltip.includes('layouts/'));
assert.strictEqual(layoutLinks.length, 1, 'only the INI layout key links');
assert.strictEqual(layoutLinks[0].range.start.line, 1, 'layout link is on the INI line');

// --- theme chain ------------------------------------------------------------
assert.strictEqual(themeRoot(page), child);
assert.deepStrictEqual(themeChain(child), [child, parent]);

// A theme with no theme.yaml is still a theme, by virtue of sitting in themes/.
const bare = path.join(root, 'themes', 'bare');
write(path.join(bare, 'partials', 'x.htm'));
const barePage = path.join(bare, 'pages', 'p.htm');
write(barePage);
assert.strictEqual(themeRoot(barePage), bare, 'theme.yaml is optional');
assert.strictEqual(documentLinks("{% partial 'x' %}", barePage).length, 1);

// A parent that points back at the child must not hang the server.
write(path.join(parent, 'theme.yaml'), "name: 'Base'\nparent: child\n");
assert.deepStrictEqual(themeChain(child), [child, parent], 'parent cycles terminate');

fs.rmSync(root, { recursive: true, force: true });
console.log('\nall assertions passed');

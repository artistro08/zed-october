#!/usr/bin/env node
'use strict';

// A document-link server for October CMS templates.
//
// It answers exactly one LSP request, `textDocument/documentLink`, turning the
// file references in a template into cmd-clickable links:
//
//     {% partial 'site/footer' %}       ->  <theme>/partials/site/footer.htm
//     {% content 'contact.htm' %}       ->  <theme>/content/contact.htm
//     {{ 'assets/css/app.css'|theme }}  ->  <theme>/assets/css/app.css
//     {{ 'account/login'|page }}        ->  <theme>/pages/account/login.htm
//     layout = "default"                ->  <theme>/layouts/default.htm
//
// Zed cannot do this without a server. Its cmd-click link support is driven by
// `textDocument/documentLink` (crates/editor/src/hover_links.rs), and the
// extension WIT API exposes no hook for producing links from WASM - the only
// way in is a real language server process.
//
// No dependencies. LSP is JSON-RPC over stdio with Content-Length framing,
// which is short enough to do by hand and keeps this a single file that the
// extension can fetch and run directly.

const fs = require('fs');
const path = require('path');
const url = require('url');

// ---------------------------------------------------------------- LSP plumbing

let buffer = Buffer.alloc(0);

function onStdin(chunk) {
  buffer = Buffer.concat([buffer, chunk]);
  for (;;) {
    const headerEnd = buffer.indexOf('\r\n\r\n');
    if (headerEnd < 0) return;
    const header = buffer.slice(0, headerEnd).toString('ascii');
    const match = /Content-Length: (\d+)/i.exec(header);
    if (!match) {
      // Unparseable header: drop it rather than spin on the same bytes.
      buffer = buffer.slice(headerEnd + 4);
      continue;
    }
    const length = Number(match[1]);
    if (buffer.length < headerEnd + 4 + length) return;
    const body = buffer.slice(headerEnd + 4, headerEnd + 4 + length).toString('utf8');
    buffer = buffer.slice(headerEnd + 4 + length);
    let message;
    try {
      message = JSON.parse(body);
    } catch {
      continue;
    }
    dispatch(message);
  }
}

// Only speak LSP when run as the server. Required as a module it is just the
// resolution functions, so the self-check below can exercise them directly.
if (require.main === module) process.stdin.on('data', onStdin);

function send(message) {
  const body = Buffer.from(JSON.stringify(message), 'utf8');
  process.stdout.write(`Content-Length: ${body.length}\r\n\r\n`);
  process.stdout.write(body);
}

const reply = (id, result) => send({ jsonrpc: '2.0', id, result });

/** Open documents, by URI. Kept in sync from didOpen/didChange/didClose. */
const documents = new Map();

function dispatch(message) {
  switch (message.method) {
    case 'initialize':
      return reply(message.id, {
        capabilities: {
          // 1 = full document sync. Templates are small; incremental sync would
          // be more code for no measurable gain.
          textDocumentSync: 1,
          documentLinkProvider: { resolveProvider: false },
        },
        serverInfo: { name: 'october-language-server' },
      });

    case 'shutdown':
      return reply(message.id, null);

    case 'exit':
      return process.exit(0);

    case 'textDocument/didOpen':
      return documents.set(message.params.textDocument.uri, message.params.textDocument.text);

    case 'textDocument/didChange': {
      const change = message.params.contentChanges[message.params.contentChanges.length - 1];
      if (change) documents.set(message.params.textDocument.uri, change.text);
      return;
    }

    case 'textDocument/didClose':
      return documents.delete(message.params.textDocument.uri);

    case 'textDocument/documentLink': {
      const uri = message.params.textDocument.uri;
      const text = documents.get(uri);
      if (text === undefined) return reply(message.id, []);
      let links = [];
      try {
        links = documentLinks(text, uriToPath(uri));
      } catch (error) {
        // A broken theme layout must not take the server down with it.
        log(`documentLink failed for ${uri}: ${error && error.message}`);
      }
      return reply(message.id, links);
    }

    default:
      // Unknown request (as opposed to a notification) still needs an answer,
      // or the client waits forever.
      if (message.id !== undefined) reply(message.id, null);
  }
}

function log(text) {
  send({ jsonrpc: '2.0', method: 'window/logMessage', params: { type: 3, message: text } });
}

// ------------------------------------------------------------ October layout

/**
 * The theme directory a template belongs to: the nearest ancestor holding a
 * `theme.yaml`. Falls back to the ancestor directly under a `themes/` segment,
 * which covers a theme that has not been given a `theme.yaml` yet.
 */
function themeRoot(filePath) {
  let dir = path.dirname(filePath);
  for (;;) {
    if (fs.existsSync(path.join(dir, 'theme.yaml'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    if (path.basename(parent).toLowerCase() === 'themes') return dir;
    dir = parent;
  }
  return null;
}

/**
 * A theme and every ancestor it inherits from, nearest first.
 *
 * October child themes name their parent by directory code in `theme.yaml`, and
 * a reference unresolved in the child falls through to the parent - which is
 * why a naive single-theme lookup reports perfectly good partials as missing.
 * Only the `parent:` key is read, so no YAML parser is needed.
 */
function themeChain(root) {
  const chain = [];
  const seen = new Set();
  let dir = root;
  while (dir && !seen.has(dir)) {
    seen.add(dir);
    chain.push(dir);
    const manifest = path.join(dir, 'theme.yaml');
    if (!fs.existsSync(manifest)) break;
    let parent = null;
    try {
      const m = /^parent:\s*['"]?([^'"\r\n]+?)['"]?\s*$/m.exec(fs.readFileSync(manifest, 'utf8'));
      parent = m && m[1].trim();
    } catch {
      break;
    }
    if (!parent) break;
    dir = path.join(path.dirname(dir), parent);
    if (!fs.existsSync(dir)) break;
  }
  return chain;
}

/**
 * Resolve one reference to a file on disk, or null.
 *
 * `subdir` is the October convention for the reference kind. `.htm` is appended
 * only when the reference does not already carry an extension - templates are
 * written both ways (`'account/sidebar'` and `'account/initial_meeting.htm'`).
 */
function resolve(chain, subdir, name, defaultExtension) {
  if (!name) return null;
  // ponytail: `@name` is a component partial, resolved through the component
  // alias in the INI section to a plugin's components/<component>/ directory.
  // That needs the plugin's registerComponents() map, i.e. parsing PHP. Skipped
  // - it is 3 of 63 references in a real theme. Resolve the alias if it ever
  // earns the work.
  if (name.startsWith('@')) return null;
  if (name.includes('..')) return null;

  const candidates = path.extname(name) ? [name] : [name + defaultExtension];
  for (const dir of chain) {
    for (const candidate of candidates) {
      const target = path.join(dir, subdir, candidate);
      if (fs.existsSync(target) && fs.statSync(target).isFile()) return target;
    }
  }
  return null;
}

// ------------------------------------------------------------------- scanning

// `{% partial 'name' %}` / `{% content "name" %}`, tolerating whitespace-control
// markers and any trailing arguments.
const TAG_REFERENCE = /\{%[-~]?\s*(partial|content)\s+(['"])([^'"]+)\2/g;

// `'assets/css/app.css'|theme` and `'account/login'|page`.
//
// Only `theme` and `page`. `|media` points outside the theme, into the app's
// storage directory, and in practice is always handed a variable
// (`post.image|media`) rather than a literal. `|app` builds a URL from the site
// root and names no file at all. Requiring a quoted string immediately before
// the pipe is also what keeps `item.page|link` from matching.
const FILTER_REFERENCE = /(['"])([^'"\n]+)\1\s*\|\s*(theme|page)\b/g;

// `layout = "default"` in the INI section: start of line, before the first `==`.
const INI_LAYOUT = /^[ \t]*layout[ \t]*=[ \t]*(['"])([^'"]+)\1/gm;

const KIND = {
  partial: { subdir: 'partials', extension: '.htm' },
  content: { subdir: 'content', extension: '.htm' },
  layout: { subdir: 'layouts', extension: '.htm' },
  page: { subdir: 'pages', extension: '.htm' },
  // `|theme` paths are relative to the theme root and already carry their own
  // extension: `'assets/css/app.css'|theme`, never `'assets/css/app'|theme`.
  theme: { subdir: '', extension: '' },
};

/** Byte offset -> LSP {line, character}, using a prebuilt line-start index. */
function positionAt(lineStarts, offset) {
  let low = 0;
  let high = lineStarts.length - 1;
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    if (lineStarts[mid] <= offset) low = mid;
    else high = mid - 1;
  }
  return { line: low, character: offset - lineStarts[low] };
}

function documentLinks(text, filePath) {
  if (!filePath) return [];
  const root = themeRoot(filePath);
  if (!root) return [];
  const chain = themeChain(root);

  const lineStarts = [0];
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '\n') lineStarts.push(i + 1);
  }

  // The INI section is everything before the first `==` separator line; a
  // `layout =` further down is Twig or PHP, not configuration.
  const separator = /^==+[ \t]*$/m.exec(text);
  const iniEnd = separator ? separator.index : text.length;

  const found = [];
  const push = (kind, name, start) => {
    const target = resolve(chain, KIND[kind].subdir, name, KIND[kind].extension);
    if (!target) return;
    found.push({
      range: {
        start: positionAt(lineStarts, start),
        end: positionAt(lineStarts, start + name.length),
      },
      target: url.pathToFileURL(target).href,
      tooltip: path.relative(path.dirname(root), target).split(path.sep).join('/'),
    });
  };

  for (const match of text.matchAll(TAG_REFERENCE)) {
    const name = match[3];
    push(match[1], name, match.index + match[0].length - name.length - 1);
  }

  // The quoted name leads here, so it starts one past the opening quote.
  for (const match of text.matchAll(FILTER_REFERENCE)) {
    push(match[3], match[2], match.index + 1);
  }

  for (const match of text.matchAll(INI_LAYOUT)) {
    if (match.index >= iniEnd) break;
    const name = match[2];
    push('layout', name, match.index + match[0].length - name.length - 1);
  }

  return found;
}

function uriToPath(uri) {
  try {
    return url.fileURLToPath(uri);
  } catch {
    return null;
  }
}

module.exports = { documentLinks, themeRoot, themeChain, resolve };

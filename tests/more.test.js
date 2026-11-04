const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function el(tag) {
  const e = { tagName: tag, children: [], attributes: {}, dataset: {}, style: {}, className: '', textContent: '', listeners: {},
    append(...kids) { this.children.push(...kids); }, appendChild(k) { this.children.push(k); return k; },
    setAttribute(k, v) { this.attributes[k] = v; }, addEventListener(n, f) { this.listeners[n] = f; },
    querySelector(sel) { const name = sel.replace('.', ''); const stack = [...this.children]; while (stack.length) { const c = stack.shift(); if ((c.className || '').split(' ').includes(name)) return c; stack.push(...(c.children || [])); } return null; },
    querySelectorAll() { return []; }, before(x) { this.beforeNode = x; } };
  Object.defineProperty(e, 'innerHTML', { set(v) { this.children = [el('span'), el('span'), el('span')]; this.children[0].className = 'mx-art'; this.children[1].className = 'mx-n'; this.children[2].className = 'mx-l'; } });
  return e;
}
function run(site) {
  const footer = el('footer'), main = el('main'), body = el('body'), head = el('head');
  main.querySelector = sel => (sel === 'footer' ? footer : null);
  const document = { head, body, createElement: el,
    querySelector: sel => (sel === 'script[data-site]' ? { dataset: { site } } : sel === 'main' ? main : null) };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../more.js'), 'utf8'), { document, location: { hostname: 'localhost' } });
  return { body, footer };
}
const links = node => { const out = []; const stack = [node]; while (stack.length) { const c = stack.shift(); if (c.tagName === 'a') out.push(c.href); stack.push(...(c.children || [])); } return out; };

test('each site shows cards for the other sites, never itself', () => {
  for (const site of ['bouquet', 'heart', 'spiral', 'equation']) {
    const { body, footer } = run(site);
    const rails = links(body).sort();
    const row = links(footer.beforeNode).sort();
    assert.equal(rails.length, 3, site);
    assert.deepEqual(rails, row);
    assert.ok(rails.every(u => /^https:\/\/[a-z-]+\.vercel\.app\/$/.test(u)));
  }
  assert.ok(!links(run('equation').body).some(u => u.includes('send-an-equation')));
  assert.ok(!links(run('bouquet').body).some(u => u.includes('sendabouquet')));
});

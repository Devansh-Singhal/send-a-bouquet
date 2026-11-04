// "More things to send": cards linking the sites in this collection to each other.
// Wide screens get a card rail on each side of the page; phones get a scrolling row above the footer.
// The same file ships in every site; each one names itself with <script src="/more.js" data-site="…">.
(() => {
  'use strict';
  const SITES = [
    { id: 'bouquet', name: 'Send a Bouquet', line: 'Lilies made of text, with music', url: 'https://sendabouquet.vercel.app' },
    { id: 'heart', name: 'Send a Heart', line: 'A heart drawn line by line', url: 'https://send-a-heart.vercel.app' },
    { id: 'spiral', name: 'Send a Spiral', line: 'Their photo in a spiral of I love yous', url: 'https://send-a-spiral.vercel.app' },
    { id: 'handdrawn', name: 'Hand-drawn Heart', line: 'Draw a heart; math redraws it for them', url: 'https://hand-drawn-heart.vercel.app' }
  ];
  const NEXT = { name: 'Coming next', line: 'A birthday cake they blow out themselves' };
  const tag = document.querySelector('script[data-site]');
  const here = (tag && tag.dataset.site) || (SITES.find(s => location.hostname && s.url.includes(location.hostname)) || {}).id;
  const others = SITES.filter(s => s.id !== here);
  if (!others.length || document.querySelector('.mx-rail')) return;

  const css = `
.mx-card{display:flex;flex-direction:column;gap:8px;width:100%;padding:10px 10px 12px;border:1px solid rgba(239,231,218,.14);border-radius:16px;background:#0c090d;color:#efe7da;text-decoration:none;text-align:left;font:14px/1.35 Karla,system-ui,sans-serif;transition:transform .2s ease,border-color .2s ease;box-sizing:border-box}
a.mx-card:hover{transform:translateY(-2px);border-color:rgba(255,152,166,.55);background:#0c090d;color:#efe7da}
a.mx-card:focus-visible{outline:2px solid #ff98a6;outline-offset:3px}
.mx-card picture,.mx-card img{display:block;width:100%;height:auto;aspect-ratio:4/3;object-fit:cover;border-radius:10px;background:#000}
.mx-card .mx-n{font:italic 500 21px/1.1 "Cormorant Garamond",Georgia,serif;color:#efe7da;margin:2px 2px 0}
.mx-card .mx-l{color:rgba(239,231,218,.62);font-size:13px;margin:0 2px}
.mx-card .mx-go{color:#ff98a6;font-size:13px;font-weight:700;margin:0 2px}
.mx-soon{border-style:dashed;background:transparent}
.mx-soon .mx-art{aspect-ratio:4/3;border-radius:10px;display:grid;place-items:center;background:radial-gradient(circle at 50% 60%,rgba(232,52,74,.18),transparent 60%);font:500 11px/1 ui-monospace,Menlo,Consolas,monospace;letter-spacing:.24em;text-transform:uppercase;color:rgba(239,231,218,.5)}
.mx-rail{display:none}
.mx-inline{margin:36px 0 8px;min-width:0}
.mx-inline .mx-h{font:italic 500 26px/1.1 "Cormorant Garamond",Georgia,serif;color:#efe7da;margin:0 0 12px;text-align:left}
.mx-row{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(156px,43%);gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;padding:2px 2px 10px;margin:0 -2px;scrollbar-width:thin}
.mx-row>*{scroll-snap-align:start}
@media (min-width:1040px) and (min-height:620px){
  .mx-inline{display:none}
  .mx-rail{display:flex;flex-direction:column;gap:14px;position:fixed;top:50%;transform:translateY(-50%);width:200px;z-index:1}
  .mx-rail .mx-h{font:500 11px/1 ui-monospace,Menlo,Consolas,monospace;letter-spacing:.24em;text-transform:uppercase;color:rgba(239,231,218,.5);margin:0 0 2px 4px}
  .mx-left{left:max(20px,calc(50% - 486px))}
  .mx-right{right:max(20px,calc(50% - 486px))}
}
@media (prefers-reduced-motion:reduce){.mx-card{transition:none}a.mx-card:hover{transform:none}}`;

  function card(site) {
    const a = document.createElement('a');
    a.className = 'mx-card';
    a.href = site.url + '/';
    a.target = '_blank';
    a.rel = 'noopener';
    a.referrerPolicy = 'origin';   // lets the other site's analytics see which site sent the visit
    const picture = document.createElement('picture');
    const still = document.createElement('source');
    still.media = '(prefers-reduced-motion: reduce)';
    still.srcset = site.url + '/card.jpg';
    const img = document.createElement('img');
    img.src = site.url + '/card.webp';
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.width = 400; img.height = 300;
    img.addEventListener('error', () => { picture.style.visibility = 'hidden'; }, { once: true });
    picture.append(still, img);
    const name = document.createElement('span'); name.className = 'mx-n'; name.textContent = site.name;
    const line = document.createElement('span'); line.className = 'mx-l'; line.textContent = site.line;
    const go = document.createElement('span'); go.className = 'mx-go'; go.textContent = 'Make one →';
    a.append(picture, name, line, go);
    return a;
  }
  function soon() {
    const div = document.createElement('div');
    div.className = 'mx-card mx-soon';
    div.innerHTML = '<span class="mx-art">soon</span><span class="mx-n"></span><span class="mx-l"></span>';
    div.querySelector('.mx-n').textContent = NEXT.name;
    div.querySelector('.mx-l').textContent = NEXT.line;
    return div;
  }
  function heading(text, tagName) { const h = document.createElement(tagName); h.className = 'mx-h'; h.textContent = text; return h; }

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // wide screens: two rails beside the page
  const half = Math.ceil(others.length / 2);
  const left = document.createElement('aside');
  left.className = 'mx-rail mx-left';
  left.setAttribute('aria-label', 'More things to send');
  left.append(heading('More to send', 'p'), ...others.slice(0, half).map(card));
  const right = document.createElement('aside');
  right.className = 'mx-rail mx-right';
  right.setAttribute('aria-label', 'More things to send, continued');
  right.append(heading('and more', 'p'), ...others.slice(half).map(card), soon());
  // all screens below that: a row of cards above the footer
  const inline = document.createElement('section');
  inline.className = 'mx-inline';
  inline.setAttribute('aria-label', 'More things to send');
  const row = document.createElement('div');
  row.className = 'mx-row';
  row.append(...others.map(card), soon());
  inline.append(heading('More ways to say it', 'h2'), row);

  const main = document.querySelector('main');
  const footer = main && main.querySelector('footer');
  if (footer) footer.before(inline); else if (main) main.append(inline);
  document.body.append(left, right);
})();

// Serves the bouquet page with link-preview tags for the person it's for,
// so WhatsApp / Instagram / iMessage show "A bouquet for Riya" instead of a generic card.
const fs = require("fs");
const path = require("path");

const template = fs.readFileSync(path.join(process.cwd(), "bouquet.html"), "utf8");

const clean = (v, n) =>
  String(v || "").replace(/[\u0000-\u001f\u007f]/g, "").replace(/\s+/g, " ").trim().slice(0, n);
const esc = (v) =>
  v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

module.exports = (req, res) => {
  const url = new URL(req.url, "https://placeholder.local");
  const to = clean(url.searchParams.get("t") || url.searchParams.get("to"), 40);
  const from = clean(url.searchParams.get("f") || url.searchParams.get("from"), 40);
  const host = req.headers["x-forwarded-host"] || req.headers.host || "";
  const origin = host ? `https://${host}` : "";

  const pageTitle = to ? `For ${to}` : "For You";
  const shareTitle = to ? `A bouquet for ${to} \u{1F338}` : "A bouquet for you \u{1F338}";
  const shareDesc = from ? `From ${from}. Tap to open.` : "Someone sent you flowers. Tap to open.";

  const meta = [
    `<title>${esc(pageTitle)}</title>`,
    `<meta name="description" content="${esc(shareDesc)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:title" content="${esc(shareTitle)}">`,
    `<meta property="og:description" content="${esc(shareDesc)}">`,
    origin ? `<meta property="og:image" content="${origin}/og.jpg">` : "",
    `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="robots" content="noindex">`,
  ].filter(Boolean).join("\n");

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800");
  res.end(template.replace("<!--META-->", meta));
};

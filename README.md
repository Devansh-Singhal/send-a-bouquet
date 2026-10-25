<div align="center">

# 🌸 ASCII Bouquet

**Send someone flowers that bloom.**
Type their name, add a note, share the link. It opens into a 3D lily bouquet made entirely of text characters, with music.

### [→ Make one now (free, no sign-up)](https://sendabouquet.vercel.app)

<img src="demo.gif" width="300" alt="A lily bouquet made of coloured text characters growing and blooming">

## ⭐ If you sent one, please star this repo

### It's how I know people are using it, and it helps others find it.

</div>

---

## How to send one

1. Open **[the site](https://sendabouquet.vercel.app)**.
2. Type their name, and optionally your name and a short note.
3. Tap **Create**, then **Copy link** or **WhatsApp**.

The link opens on their name. You can also make a heart-shaped QR code to print or put on a gift. When they tap, the music starts and the stems grow, the buds swell, and the lilies open and turn toward them.

Nothing is stored anywhere. The name and note live only inside the link you share.

## How it works

- **The flowers:** 13 lilies, each made of six curved, folded petals in real 3D. They open from round buds, turn toward the viewer and sway in a breeze. Everything is drawn on a hidden canvas every frame.
- **The ASCII look:** a WebGL shader turns that hidden picture into a grid of coloured characters, where brighter cells get denser characters, with brightness jitter for a brushed texture. There's a Canvas 2D fallback.
- **Link previews:** a tiny serverless function adds "A bouquet for [their name] 🌸" to each link (links look like `/f?t=Name&f=From&n=Note`), so WhatsApp and iMessage show the name in the preview.
- It's plain HTML, CSS and JavaScript, with no framework and no build step. It works on phones.

## Make your own copy

Fork this repo (top right) and import your fork on [Vercel](https://vercel.com/new), or click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Devansh-Singhal/send-a-bouquet)

Free to use and change under the MIT license. Please keep the credit, and a ⭐ is always appreciated.

---

<div align="center">

Made by [Devansh Singhal](https://github.com/Devansh-Singhal) · If this made someone smile, **⭐ star the repo**

</div>

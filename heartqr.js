// Heart-shaped QR code.
// The real QR code is turned so its three corner squares sit at the left, right and bottom,
// which makes it a diamond: the lower half of a heart. The two top lobes are filled with
// decorative squares on the same diagonal grid, kept two modules away from the code itself.
// Needs qrcode-generator (window.qrcode). Error correction is H (30%), so the code still reads
// with the rounded corner squares.
(function (root) {
  "use strict";

  function rng(seed) {
    let s = seed >>> 0 || 1;
    return () => {
      s ^= s << 13; s >>>= 0;
      s ^= s >> 17;
      s ^= s << 5; s >>>= 0;
      return s / 4294967296;
    };
  }
  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function roundRect(g, x, y, w, h, r, keep) {
    if (!keep) g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  }

  function drawHeartQR(canvas, text, opts) {
    const o = Object.assign({ size: 1000, fg: "#c8232f", bg: "#000000", gap: 2, density: 0.5, round: true, deco: true, inset: 0.04, radius: 0.4 }, opts || {});
    // strongest error correction that keeps the code from getting too dense (long notes make long links)
    // Fewer, bigger squares scan far more reliably (iPhone Photos is strict), so take the
    // smallest grid any level gives, then the strongest error correction that fits it (or fits 29x29).
    const bytes = unescape(encodeURIComponent(text));
    const made = ["L", "M", "Q", "H"].map((level) => {
      const q = root.qrcode(0, level);
      q.addData(bytes, "Byte");
      q.make();
      return q;
    });
    const smallest = Math.min(...made.map((q) => q.getModuleCount()));
    const limit = Math.max(smallest, 29);
    let qr = made[0];
    for (const q of made) if (q.getModuleCount() <= limit) qr = q;
    const n = qr.getModuleCount();
    const dark = (r, c) => r >= 0 && c >= 0 && r < n && c < n && qr.isDark(r, c);
    const inFinder = (r, c) =>
      (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);

    // rotation that sends the corner without a finder (bottom-right) to the top
    const TH = (225 * Math.PI) / 180, CS = Math.cos(TH), SN = Math.sin(TH);
    const h = n / 2;                       // half side of the code, in modules
    const toScreen = (x, y) => [x * CS - y * SN, x * SN + y * CS]; // code-space -> heart-space (module units)

    // heart = the code's diamond + two circles on its upper edges
    const R2 = Math.SQRT2;
    const lobeR = h;
    const lobeL = [-h * R2 / 2, -h * R2 / 2], lobeRt = [h * R2 / 2, -h * R2 / 2];
    const inLobe = (x, y, pad) =>
      Math.hypot(x - lobeL[0], y - lobeL[1]) <= lobeR - pad || Math.hypot(x - lobeRt[0], y - lobeRt[1]) <= lobeR - pad;

    // fit the heart in the canvas with a margin
    const top = -h * R2 / 2 - lobeR, bottom = h * R2, half = h * R2 / 2 + lobeR;
    const margin = 2.2;
    const scale = Math.min(o.size / (2 * (half + margin)), o.size / (bottom - top + 2 * margin));
    const cy = o.size / 2 - ((top + bottom) / 2) * scale;
    canvas.width = o.size;
    canvas.height = o.size;
    const g = canvas.getContext("2d");
    g.fillStyle = o.bg;
    g.fillRect(0, 0, o.size, o.size);

    g.save();
    g.translate(o.size / 2, cy);
    g.rotate(TH);
    g.scale(scale, scale);
    g.translate(-h, -h);
    g.fillStyle = o.fg;
    const inset = o.inset;

    // the code's own modules (corner squares drawn separately, rounded)
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (!dark(r, c) || (o.round && inFinder(r, c))) continue;
        g.fillRect(c + inset, r + inset, 1 - 2 * inset, 1 - 2 * inset);
      }
    }
    // rounded corner squares: a ring and a centre
    for (const [fr, fc] of o.round ? [[0, 0], [0, n - 7], [n - 7, 0]] : []) {
      g.save();
      const k = o.radius;
      roundRect(g, fc, fr, 7, 7, 2.1 * k);
      roundRect(g, fc + 1, fr + 1, 5, 5, 1.35 * k, true);
      g.fill("evenodd");
      roundRect(g, fc + 2, fr + 2, 3, 3, 0.75 * k);
      g.fill();
      g.restore();
    }

    // decorative squares in the two lobes, on the same grid, kept `gap` modules clear of the code
    const rnd = rng(hash(text));
    const span = Math.ceil(n * 0.9);
    for (let r = -span; r < n + span; r++) {
      for (let c = -span; c < n + span; c++) {
        if (r >= -o.gap && r < n + o.gap && c >= -o.gap && c < n + o.gap) continue;
        const [x, y] = toScreen(c + 0.5 - h, r + 0.5 - h);
        if (!inLobe(x, y, 0.75)) continue;
        if (o.deco && rnd() < o.density) g.fillRect(c + inset, r + inset, 1 - 2 * inset, 1 - 2 * inset);
      }
    }
    g.restore();
    return { modules: n };
  }

  // Plain square QR (dark on white, standard quiet zone): the fallback that every scanner reads.
  function drawPlainQR(canvas, text, opts) {
    const o = Object.assign({ size: 1000, fg: "#1a0d10", bg: "#ffffff" }, opts || {});
    const qr = root.qrcode(0, "M");
    qr.addData(unescape(encodeURIComponent(text)), "Byte");
    qr.make();
    const n = qr.getModuleCount(), quiet = 4;
    const m = Math.floor(o.size / (n + quiet * 2));
    const off = Math.floor((o.size - m * n) / 2);
    canvas.width = canvas.height = o.size;
    const g = canvas.getContext("2d");
    g.fillStyle = o.bg;
    g.fillRect(0, 0, o.size, o.size);
    g.fillStyle = o.fg;
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) g.fillRect(off + c * m, off + r * m, m, m);
    return { modules: n };
  }

  root.drawHeartQR = drawHeartQR;
  root.drawPlainQR = drawPlainQR;
})(typeof window !== "undefined" ? window : globalThis);

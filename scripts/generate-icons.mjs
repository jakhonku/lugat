// Lug'atcha uchun PWA ikonkalarini hosil qiladi (192, 512 va apple-touch).
// Tashqi kutubxonasiz — sof Node (zlib) bilan PNG yoziladi.
// Ishlatish: npm run icons
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");
const iconsDir = join(publicDir, "icons");
mkdirSync(iconsDir, { recursive: true });

// --- CRC32 ---
const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePNG(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  // raw scanlines with filter byte 0
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = deflateSync(raw, { level: 9 });

  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// --- tiny drawing helpers ---
function makeCanvas(size) {
  return { size, buf: Buffer.alloc(size * size * 4) };
}
function setPx(c, x, y, [r, g, b, a = 255]) {
  if (x < 0 || y < 0 || x >= c.size || y >= c.size) return;
  const i = (y * c.size + x) * 4;
  // simple alpha-over
  const ia = a / 255;
  c.buf[i] = Math.round(r * ia + c.buf[i] * (1 - ia));
  c.buf[i + 1] = Math.round(g * ia + c.buf[i + 1] * (1 - ia));
  c.buf[i + 2] = Math.round(b * ia + c.buf[i + 2] * (1 - ia));
  c.buf[i + 3] = 255;
}
function fillRect(c, x0, y0, w, h, color) {
  for (let y = y0; y < y0 + h; y++)
    for (let x = x0; x < x0 + w; x++) setPx(c, x, y, color);
}
function fillRoundRect(c, x0, y0, w, h, r, color) {
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) {
      const dx = Math.min(x - x0, x0 + w - 1 - x);
      const dy = Math.min(y - y0, y0 + h - 1 - y);
      if (dx < r && dy < r) {
        const cx = x0 + (dx === x - x0 ? r : w - r);
        const cy = y0 + (dy === y - y0 ? r : h - r);
        if ((x - cx) ** 2 + (y - cy) ** 2 > r * r) continue;
      }
      setPx(c, x, y, color);
    }
  }
}
function fillCircle(c, cx, cy, r, color) {
  for (let y = cy - r; y <= cy + r; y++)
    for (let x = cx - r; x <= cx + r; x++)
      if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) setPx(c, x, y, color);
}

// Lug'atcha palitrasi
const CORAL = [250, 128, 76, 255];
const MINT = [45, 212, 191, 255];
const YELLOW = [250, 204, 21, 255];
const PURPLE = [168, 85, 247, 255];
const WHITE = [255, 255, 255, 255];

function drawIcon(size, { maskable } = {}) {
  const c = makeCanvas(size);
  // To'liq coral fon (maskable "safe zone" uchun butun maydon to'ldiriladi)
  fillRect(c, 0, 0, size, size, CORAL);

  const s = size / 512; // scale factor
  // Markazda oq "kitob/karta"
  const cardW = Math.round(300 * s);
  const cardH = Math.round(230 * s);
  const cardX = Math.round((size - cardW) / 2);
  const cardY = Math.round((size - cardH) / 2);
  fillRoundRect(c, cardX, cardY, cardW, cardH, Math.round(40 * s), WHITE);

  // Kitob o'rtasidagi chiziq
  fillRect(c, Math.round(size / 2 - 3 * s), cardY, Math.round(6 * s), cardH, [
    230, 230, 230, 255,
  ]);

  // Rangli "harf" nuqtalari
  fillCircle(c, Math.round(cardX + cardW * 0.28), Math.round(cardY + cardH * 0.35), Math.round(26 * s), MINT);
  fillCircle(c, Math.round(cardX + cardW * 0.72), Math.round(cardY + cardH * 0.35), Math.round(26 * s), PURPLE);
  fillRoundRect(c, Math.round(cardX + cardW * 0.18), Math.round(cardY + cardH * 0.6), Math.round(cardW * 0.26), Math.round(18 * s), Math.round(9 * s), YELLOW);
  fillRoundRect(c, Math.round(cardX + cardW * 0.56), Math.round(cardY + cardH * 0.6), Math.round(cardW * 0.26), Math.round(18 * s), Math.round(9 * s), YELLOW);

  // Tepada yulduzcha
  fillCircle(c, Math.round(size * 0.78), Math.round(size * 0.2), Math.round(22 * s), YELLOW);

  return encodePNG(size, size, c.buf);
}

writeFileSync(join(iconsDir, "icon-192.png"), drawIcon(192, { maskable: true }));
writeFileSync(join(iconsDir, "icon-512.png"), drawIcon(512, { maskable: true }));
writeFileSync(join(iconsDir, "apple-touch-icon.png"), drawIcon(180));
writeFileSync(join(publicDir, "favicon.ico"), drawIcon(48)); // PNG baytlari .ico sifatida (brauzerlar qabul qiladi)

console.log("✅ Ikonkalar hosil qilindi: public/icons/ va favicon.ico");

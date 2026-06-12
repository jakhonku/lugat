/** Apple (iPhone) uslubidagi emoji rasmlari uchun CDN (offline'da SW keshlaydi). */
export const APPLE_EMOJI_BASE =
  "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/";

/**
 * Emoji belgisini emoji-datasource fayl nomiga (codepoint ketma-ketligi) o'giradi.
 * Har bir codepoint kamida 4 xonali hex bo'ladi (ASCII keycap: "1" -> "0031"),
 * FE0F / 200D / 20E3 kabi belgilar saqlanadi.
 */
export function emojiToCodePoint(emoji: string): string {
  const points: string[] = [];
  for (const ch of emoji) {
    const cp = ch.codePointAt(0);
    if (cp === undefined) continue;
    points.push(cp.toString(16).padStart(4, "0"));
  }
  return points.join("-");
}

/** Emoji uchun to'liq Apple rasm manzili. */
export function appleEmojiUrl(emoji: string): string {
  return `${APPLE_EMOJI_BASE}${emojiToCodePoint(emoji)}.png`;
}

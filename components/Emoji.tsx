"use client";

import { useState } from "react";
import { appleEmojiUrl, emojiToCodePoint } from "@/lib/emoji";
import { cn } from "@/lib/utils";

interface Props {
  emoji: string;
  /** O'qiladigan nom. Berilmasa — bezak (aria-hidden). */
  label?: string;
  className?: string;
}

/**
 * Emojini Apple (iPhone) uslubidagi rasm sifatida ko'rsatadi. O'lcham atrofdagi
 * matn o'lchamiga bog'liq (1em). Rasm topilmasa qurilmaning o'z emojisiga qaytadi.
 */
export function Emoji({ emoji, label, className }: Props) {
  const [failed, setFailed] = useState(false);
  const code = emojiToCodePoint(emoji);

  if (failed || !code) {
    return (
      <span
        className={className}
        role={label ? "img" : undefined}
        aria-label={label}
        aria-hidden={label ? undefined : true}
      >
        {emoji}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={appleEmojiUrl(emoji)}
      alt={label ?? ""}
      aria-hidden={label ? undefined : true}
      draggable={false}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn(
        "inline-block h-[1em] w-[1em] select-none object-contain align-[-0.125em]",
        className,
      )}
    />
  );
}

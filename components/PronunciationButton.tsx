"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  text: string;
  className?: string;
  label?: string;
}

/** Speaks the given English text using the Web Speech API. */
export function PronunciationButton({ text, className, label }: Props) {
  const [speaking, setSpeaking] = useState(false);

  const speak = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    utter.rate = 0.85; // bolalar uchun biroz sekinroq
    utter.pitch = 1.1;
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utter);
  }, [text]);

  return (
    <motion.button
      type="button"
      onClick={speak}
      whileTap={{ scale: 0.85 }}
      animate={speaking ? { scale: [1, 1.15, 1] } : { scale: 1 }}
      transition={{ duration: 0.4, repeat: speaking ? Infinity : 0 }}
      aria-label={label ?? `"${text}" so'zini eshitish`}
      className={cn(
        "inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-2xl bg-secondary px-4 font-bold text-secondary-foreground shadow-mint transition-all hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
    >
      <Volume2 className="h-5 w-5" />
      {label ? <span>{label}</span> : null}
    </motion.button>
  );
}

"use client";

import { AnimatePresence, motion } from "framer-motion";

const EMOJIS = ["⭐", "🌟", "✨", "🎉", "💫", "🌈"];

interface Props {
  /** Increment this number to trigger a new burst. */
  trigger: number;
}

/** A small celebratory star/confetti burst from the top-center of the screen. */
export function StarBurst({ trigger }: Props) {
  return (
    <AnimatePresence>
      {trigger > 0 && (
        <motion.div
          key={trigger}
          className="pointer-events-none fixed inset-x-0 top-24 z-40 flex justify-center"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const distance = 90 + (i % 3) * 40;
            return (
              <motion.span
                key={i}
                className="absolute text-2xl"
                initial={{ x: 0, y: 0, opacity: 1, scale: 0.4 }}
                animate={{
                  x: Math.cos(angle) * distance,
                  y: Math.sin(angle) * distance,
                  opacity: 0,
                  scale: 1.2,
                  rotate: 180,
                }}
                transition={{ duration: 0.9, ease: "easeOut" }}
              >
                {EMOJIS[i % EMOJIS.length]}
              </motion.span>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

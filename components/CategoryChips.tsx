"use client";

import { motion } from "framer-motion";
import { categoryLabel, cn } from "@/lib/utils";

interface Props {
  categories: string[];
  active: string | null;
  onSelect: (category: string) => void;
}

export function CategoryChips({ categories, active, onSelect }: Props) {
  if (!categories.length) return null;

  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-1 sm:flex-wrap sm:justify-center">
      {categories.map((category) => {
        const isActive = active === category;
        return (
          <motion.button
            key={category}
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={() => onSelect(category)}
            aria-pressed={isActive}
            className={cn(
              "h-11 shrink-0 whitespace-nowrap rounded-full border-2 px-4 text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isActive
                ? "border-transparent bg-purple text-purple-foreground shadow-purple"
                : "border-border bg-card text-foreground hover:bg-muted",
            )}
          >
            {categoryLabel(category)}
          </motion.button>
        );
      })}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "lugatcha-install-dismissed";

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY) === "1") return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    const installed = () => setVisible(false);
    window.addEventListener("appinstalled", installed);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setVisible(false);
  };

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed inset-x-3 bottom-[76px] z-40 mx-auto max-w-md rounded-2xl border-2 border-border bg-card p-4 shadow-card md:bottom-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent/30 text-2xl">
              📚
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-extrabold leading-tight">Lug'atcha'ni o'rnating</p>
              <p className="text-sm text-muted-foreground">
                Telefoningizga ilova qilib qo'shing!
              </p>
            </div>
            <button
              type="button"
              onClick={install}
              className="inline-flex h-11 items-center gap-1.5 rounded-2xl bg-primary px-4 font-bold text-primary-foreground shadow-soft active:scale-95"
            >
              <Download className="h-5 w-5" />
              <span className="whitespace-nowrap">O'rnatish</span>
            </button>
            <button
              type="button"
              onClick={dismiss}
              aria-label="Yopish"
              className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

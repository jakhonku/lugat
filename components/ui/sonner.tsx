"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            "rounded-2xl border-2 border-border bg-card text-card-foreground shadow-card font-sans",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

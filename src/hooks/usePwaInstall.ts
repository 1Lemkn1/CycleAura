import { useEffect, useState } from "react";
import type { PwaDeferredPrompt } from "../types";

export function usePwaInstall() {
  const [canInstall, setCanInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<PwaDeferredPrompt | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setCanInstall(false);
  };

  return { canInstall, install } as const;
}

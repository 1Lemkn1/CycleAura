const SW_PATH = `${import.meta.env.BASE_URL}sw.js`;

/**
 * Registers the service worker that makes the app installable and usable offline.
 * Dev mode is skipped on purpose: a cache-first shell would hide HMR updates.
 */
export function registerServiceWorker() {
  if (!import.meta.env.PROD) return;
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  if (!window.isSecureContext) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker
      // scope и updateViaCache важны для установки из подпапки (GitHub Pages):
      // воркер должен обновляться мимо HTTP-кеша и управлять своей папкой.
      .register(SW_PATH, { scope: "./", updateViaCache: "none" })
      .then((registration) => registration.update().catch(() => undefined))
      .catch(() => {
        // Offline support is a bonus: a failed registration must never break the app.
      });
  });
}

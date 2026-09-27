import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { CareIcon } from "./CareIcon";

const FOCUSABLE = 'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex="0"]';

export function BottomSheet({ open, onClose, title, subtitle, children }: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const titleId = useId();
  const subtitleId = useId();
  const panel = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => panel.current?.focus());
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
      }
      if (event.key !== "Tab") return;
      const elements = Array.from(panel.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (!first) { event.preventDefault(); return; }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [open]);

  if (!open) return null;
  return createPortal(
    <div className="sheet-backdrop animate-fade-in" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div ref={panel} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={subtitle ? subtitleId : undefined} tabIndex={-1} className="sheet-panel animate-sheet-enter">
        <div className="relative mb-6 px-8 text-center">
          <div className="mx-auto mb-5 h-1 w-9 rounded-full bg-rose-100" aria-hidden="true" />
          <h2 id={titleId} className="text-lg font-semibold text-slate-800">{title}</h2>
          {subtitle && <p id={subtitleId} className="mt-1.5 text-sm leading-relaxed text-slate-500">{subtitle}</p>}
          <button type="button" onClick={onClose} aria-label="Закрыть" className="absolute top-1 right-0 flex h-10 w-10 items-center justify-center rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-600"><CareIcon name="close" className="h-5 w-5" /></button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
import { useEffect } from "react";
import type { ReactNode } from "react";
import type { TabId } from "../types";

const TABS: { id: TabId; label: string; render: (active: boolean) => ReactNode }[] = [
  {
    id: "today",
    label: "Сегодня",
    render: () => (
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    ),
  },
  {
    id: "calendar",
    label: "Календарь",
    render: () => (
      <>
        <rect x="3" y="4.5" width="18" height="17" rx="2.5" />
        <path d="M16 2.5v4" />
        <path d="M8 2.5v4" />
        <path d="M3 10.5h18" />
        <path d="M7.5 14.5h2M11 14.5h2M14.5 14.5h2M7.5 18h2M11 18h2M14.5 18h2" />
      </>
    ),
  },
  {
    id: "history",
    label: "История",
    render: () => (
      <>
        <path d="M4 6.5h16M4 12h16M4 17.5h16" />
        <circle cx="4" cy="6.5" r="0.6" />
      </>
    ),
  },
  {
    id: "profile",
    label: "Профиль",
    render: () => (
      <>
        <circle cx="12" cy="7.5" r="4" />
        <path d="M4.5 21.5c0-4.1 3.4-7.5 7.5-7.5s7.5 3.4 7.5 7.5" />
        <path d="M7.8 5.4c1.4-2.5 7-2.5 8.4 0" />
      </>
    ),
  },
  {
    id: "settings",
    label: "Настройки",
    render: () => (
      <>
        <path d="M12.22 2.5h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V19.5a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4.5a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
  },
];

interface LayoutProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  children: ReactNode;
}

export function Layout({ activeTab, onTabChange, children }: LayoutProps) {
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [activeTab]);

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="flex-1 pb-[calc(104px+env(safe-area-inset-bottom))]">{children}</main>

      <nav aria-label="Главная навигация" className="fixed bottom-0 left-0 right-0 z-20 border-t border-rose-100/80 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-stretch justify-between px-2 pt-2 pb-1">
          {TABS.map((tab) => {
            const active = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                aria-label={tab.label}
                aria-current={active ? "page" : undefined}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-1 flex-col items-center gap-1 rounded-2xl py-1 transition ${
                  active ? "text-[#c66c91]" : "text-[#aaa0ad] hover:text-rose-400"
                }`}
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition ${
                    active
                      ? "border-[#c66c91] bg-rose-50"
                      : "border-[#b8b0bc] bg-white/70"
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-7 w-7"
                    aria-hidden="true"
                  >
                    {tab.render(active)}
                  </svg>
                </span>
                <span className={`text-[10px] font-semibold ${active ? "text-[#b56688]" : "text-[#98899a]"}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

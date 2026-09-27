import type { SVGProps } from "react";

type CareIconProps = SVGProps<SVGSVGElement> & {
  name: "heart" | "leaf" | "lock" | "calendar" | "plus" | "check" | "close" | "chevron";
};

export function CareIcon({ name, ...props }: CareIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {name === "heart" && <path d="M20.4 4.6a5.2 5.2 0 0 0-7.4 0L12 5.7l-1-1.1a5.2 5.2 0 0 0-7.4 7.4L12 20.4l8.4-8.4a5.2 5.2 0 0 0 0-7.4Z" />}
      {name === "leaf" && <><path d="M20 3C9 2 3 7 5 14c2 7 14 5 15-11Z" /><path d="M3 21 15 9M8 16v-5M8 16h5" /></>}
      {name === "lock" && <><rect x="5" y="10" width="14" height="11" rx="3" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" /></>}
      {name === "calendar" && <><rect x="4" y="5" width="16" height="16" rx="3" /><path d="M8 3v4m8-4v4M4 11h16M8 15h2m4 0h2m-8 3h2" /></>}
      {name === "plus" && <path d="M12 5v14M5 12h14" />}
      {name === "check" && <path d="m5 12 4.5 4.5L19 7" />}
      {name === "close" && <path d="m6 6 12 12M6 18 18 6" />}
      {name === "chevron" && <path d="m9 5 7 7-7 7" />}
    </svg>
  );
}
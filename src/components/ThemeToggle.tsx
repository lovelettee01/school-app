"use client";

import { useEffect, useState } from "react";
import { getThemeMode, setThemeMode } from "@/lib/storage";
import { ThemeMode } from "@/lib/types";

function resolveTheme(mode: ThemeMode) {
  if (mode === "system") {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  }
  return mode;
}

export function applyTheme(mode: ThemeMode) {
  const resolved = resolveTheme(mode);
  document.documentElement.setAttribute("data-theme", resolved);
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>(() => getThemeMode());

  useEffect(() => {
    applyTheme(theme);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => {
      if (getThemeMode() === "system") {
        applyTheme("system");
      }
    };
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [theme]);

  const updateTheme = (next: ThemeMode) => {
    setTheme(next);
    setThemeMode(next);
    applyTheme(next);
  };

  return (
    <div className="inline-flex gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1">
      {(["light", "dark", "system"] as ThemeMode[]).map((mode) => (
        <button
          key={mode}
          type="button"
          onClick={() => updateTheme(mode)}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
            theme === mode
              ? "bg-[var(--primary)] text-[var(--primary-contrast)]"
              : "text-[var(--text-muted)] hover:bg-[var(--surface-muted)]"
          }`}
        >
          {mode}
        </button>
      ))}
    </div>
  );
}

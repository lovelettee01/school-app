import React from "react";

type Props = {
  message: string;
  className?: string;
};

export default function EmptyState({ message, className = "" }: Props) {
  return (
    <div
      className={`rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-muted)] p-4 text-sm text-[var(--text-muted)] ${className}`}
      aria-live="polite"
    >
      {message}
    </div>
  );
}

import React from "react";

type Props = {
  message?: string;
  className?: string;
};

export default function LoadingState({ message = "로딩 중입니다...", className = "" }: Props) {
  return (
    <div
      className={`rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4 text-sm text-[var(--text-muted)] ${className}`}
      aria-busy="true"
    >
      {message}
    </div>
  );
}

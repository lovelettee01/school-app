import React from "react";

type Props = {
  message: string;
  onRetry?: () => void;
  className?: string;
};

export default function ErrorState({ message, onRetry, className = "" }: Props) {
  return (
    <div
      className={`rounded-xl border border-rose-400/50 bg-rose-500/10 p-4 text-sm text-rose-500 ${className}`}
      role="alert"
      aria-live="polite"
    >
      <p>{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 rounded-lg border border-rose-400/50 px-3 py-1.5 text-xs font-semibold"
        >
          다시 시도
        </button>
      )}
    </div>
  );
}

"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app error]", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] bg-page-bg flex flex-col items-center justify-center px-6 text-center">
      <p className="text-ink-faint text-[12px] tracking-wider uppercase mb-3">
        Something broke
      </p>
      <h1 className="font-semibold text-[36px] text-ink leading-tight mb-3">
        Walter hit turbulence.
      </h1>
      <p className="text-ink-soft text-lg max-w-md mb-8">
        An unexpected error got in the way. Your trip and cart are safe on this
        device.
      </p>
      <button
        onClick={reset}
        className="bg-accent text-white rounded-[10px] px-8 py-3 text-sm font-semibold hover:bg-accent-light transition-colors"
      >
        Try again
      </button>
    </div>
  );
}

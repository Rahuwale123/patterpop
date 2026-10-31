"use client";

import { useState } from "react";

export function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          setCopied(false);
        }
      }}
      className="rounded-lg border-2 border-dashed border-madder px-3 py-1.5 text-sm font-semibold text-madder hover:bg-aida-deep"
    >
      <span aria-live="polite">{copied ? "Copied" : label}</span>
    </button>
  );
}

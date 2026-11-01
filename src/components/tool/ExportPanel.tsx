"use client";

import clsx from "clsx";
import { useState } from "react";
import type { Pattern } from "@/lib/pattern/pipeline";
import { downloadBlob, patternFilename } from "@/lib/pattern/download";
import type { Paper, PdfOptions } from "@/lib/pdf/buildPdf";

export function defaultPaper(): Paper {
  const lang = typeof navigator === "undefined" ? "" : navigator.language;
  return /^(en-US|en-CA|es-MX|fr-CA)$/i.test(lang) ? "letter" : "a4";
}

type Props = {
  pattern: Pattern;
  /** Craft-specific PDF wording and supplies (paper is chosen here) */
  pdf: Omit<PdfOptions, "paper">;
  /** Used in the download file name, e.g. "perler-bead-pattern" */
  fileKind?: string;
  /** Kept by the parent so the choice survives starting a new photo */
  paper: Paper;
  onPaperChange: (p: Paper) => void;
};

export function ExportPanel({ pattern, pdf, paper, onPaperChange: setPaper, fileKind = "cross-stitch" }: Props) {
  const [busy, setBusy] = useState<"pdf" | "png" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (kind: "pdf" | "png") => {
    setBusy(kind);
    setError(null);
    try {
      // TODO(pro): gate larger grids (>150 wide, >40 colours) and watermark-free PDFs behind a licence-key check here.
      if (kind === "pdf") {
        const { buildPdf } = await import("@/lib/pdf/buildPdf");
        downloadBlob(await buildPdf(pattern, { ...pdf, paper }), patternFilename(fileKind, pattern.width, pattern.height, "pdf"));
      } else {
        const { buildChartPng } = await import("@/lib/pattern/png");
        downloadBlob(await buildChartPng(pattern), patternFilename(fileKind, pattern.width, pattern.height, "png"));
      }
    } catch {
      setError("Sorry, the download didn't work. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <fieldset>
        <legend className="text-sm font-semibold">Paper size</legend>
        <div className="mt-1 flex gap-2">
          {(["a4", "letter"] as const).map((p) => (
            <label
              key={p}
              className={clsx(
                "cursor-pointer rounded-full border-2 border-dashed px-3 py-1 text-sm font-semibold has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-indigo",
                paper === p ? "border-madder bg-madder text-linen" : "border-hoop-dark/50",
              )}
            >
              <input type="radio" name="paper" value={p} checked={paper === p} onChange={() => setPaper(p)} className="sr-only" />
              {p === "a4" ? "A4" : "US Letter"}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="mt-3 flex flex-col gap-2">
        <button
          onClick={() => run("pdf")}
          disabled={busy !== null}
          className="rounded-lg bg-madder px-4 py-2.5 font-semibold text-linen hover:bg-madder-dark disabled:opacity-60"
        >
          {busy === "pdf" ? "Making your PDF…" : "Download PDF pattern"}
        </button>
        <button
          onClick={() => run("png")}
          disabled={busy !== null}
          className="rounded-lg border-2 border-dashed border-madder px-4 py-2 font-semibold text-madder hover:bg-aida-deep disabled:opacity-60"
        >
          {busy === "png" ? "Making your image…" : "Download chart as PNG"}
        </button>
      </div>
      <p className="mt-2 text-xs text-muted">Cover page, chart pages and a shopping list. Made on your device.</p>
      {error && (
        <p role="alert" className="mt-2 text-sm font-semibold text-madder">
          {error}
        </p>
      )}
    </div>
  );
}

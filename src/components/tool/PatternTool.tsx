"use client";

import { useEffect, useRef, useState } from "react";
import { Uploader } from "./Uploader";
import { Cropper } from "./Cropper";
import { Settings } from "./Settings";
import { Preview } from "./Preview";
import { ColorKey } from "./ColorKey";
import { DEFAULT_SETTINGS, type Pattern, type PatternSettings } from "@/lib/pattern/pipeline";
import { cropSource, loadFile, runPattern, type CropRect, type SourceImage } from "@/lib/pattern/runner";
import { FABRIC_COUNTS, finishedSizeInches, inchesToCm, type FabricCount } from "@/lib/pattern/fabric";

type Step = "upload" | "crop" | "pattern";

const ACCEPTED = /^image\/(jpeg|png|webp|heic|heif)$/i;

export default function PatternTool() {
  const [step, setStep] = useState<Step>("upload");
  const [source, setSource] = useState<SourceImage | null>(null);
  const [crop, setCrop] = useState<CropRect | undefined>();
  const [cropped, setCropped] = useState<SourceImage | null>(null);
  const [settings, setSettings] = useState<PatternSettings>(DEFAULT_SETTINGS);
  const [fabric, setFabric] = useState<FabricCount>(14);
  const [pattern, setPattern] = useState<Pattern | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "working">("idle");
  const [error, setError] = useState<string | null>(null);
  const runId = useRef(0);

  const onFile = async (file: File) => {
    setError(null);
    if (!ACCEPTED.test(file.type) && !/\.hei[cf]$/i.test(file.name)) {
      setError("That file isn't a photo we can read. Try a JPG, PNG, WebP or HEIC image.");
      return;
    }
    setStatus("loading");
    try {
      const src = await loadFile(file);
      setSource(src);
      setCrop(undefined);
      setPattern(null);
      setStep("crop");
    } catch {
      setError("Sorry, that photo couldn't be opened. Try saving it as a JPG first.");
    } finally {
      setStatus("idle");
    }
  };

  // Re-run the pipeline when the crop or settings change. Slider drags are debounced,
  // and results from older runs are ignored.
  useEffect(() => {
    if (!cropped) return;
    const id = ++runId.current;
    const t = setTimeout(() => {
      setStatus("working");
      runPattern(cropped, settings)
        .then(({ pattern: p }) => {
          if (id === runId.current) setPattern(p);
        })
        .catch(() => id === runId.current && setError("Something went wrong making the pattern. Please try again."))
        .finally(() => id === runId.current && setStatus("idle"));
    }, 200);
    return () => clearTimeout(t);
  }, [cropped, settings]);

  const live = (
    <p aria-live="polite" className="sr-only">
      {status === "loading" ? "Opening your photo" : status === "working" ? "Updating pattern" : ""}
    </p>
  );

  if (step === "upload" || !source) {
    return (
      <div>
        {live}
        <Uploader onFile={onFile} disabled={status === "loading"} />
        {status === "loading" && <p className="mt-4 text-center font-semibold">Opening your photo…</p>}
        {error && (
          <p role="alert" className="mx-auto mt-4 max-w-md text-center font-semibold text-madder">
            {error}
          </p>
        )}
      </div>
    );
  }

  if (step === "crop") {
    return (
      <Cropper
        source={source}
        initial={crop}
        onCancel={() => setStep("upload")}
        onDone={(r) => {
          setCrop(r);
          setCropped(cropSource(source, r));
          setStep("pattern");
        }}
      />
    );
  }

  const wIn = pattern ? finishedSizeInches(pattern.width, fabric) : 0;
  const hIn = pattern ? finishedSizeInches(pattern.height, fabric) : 0;

  return (
    <div>
      {live}
      <div className="mb-4 flex flex-wrap justify-center gap-2">
        <button onClick={() => setStep("crop")} className="rounded-lg border-2 border-dashed border-hoop-dark/50 px-4 py-1.5 text-sm font-semibold hover:bg-aida-deep">
          Adjust crop
        </button>
        <button onClick={() => setStep("upload")} className="rounded-lg border-2 border-dashed border-hoop-dark/50 px-4 py-1.5 text-sm font-semibold hover:bg-aida-deep">
          Use a different photo
        </button>
      </div>
      <div className="grid gap-5 md:grid-cols-[280px_minmax(0,1fr)]">
        <div className="h-fit rounded-xl border-2 border-dashed border-hoop-dark/50 bg-linen p-4">
          <Settings value={settings} onChange={setSettings}>
            <div>
              <label htmlFor="set-fabric" className="text-sm font-semibold">
                Fabric count
              </label>
              <select
                id="set-fabric"
                value={fabric}
                onChange={(e) => setFabric(Number(e.currentTarget.value) as FabricCount)}
                className="mt-1 w-full rounded-md border border-charcoal/30 bg-linen px-2 py-1.5"
              >
                {FABRIC_COUNTS.map((c) => (
                  <option key={c} value={c}>
                    {c}-count Aida
                  </option>
                ))}
              </select>
            </div>
          </Settings>
          {pattern && (
            <p className="mt-4 border-t border-dashed border-hoop-dark/40 pt-3 text-sm">
              <strong>
                {pattern.width} × {pattern.height} stitches
              </strong>
              , {pattern.palette.length} colours.
              <br />
              Finished size {wIn.toFixed(1)} × {hIn.toFixed(1)} in ({inchesToCm(wIn).toFixed(1)} ×{" "}
              {inchesToCm(hIn).toFixed(1)} cm).
            </p>
          )}
        </div>
        <div className="min-w-0">
          {pattern ? (
            <div className={status === "working" ? "opacity-70 transition-opacity" : undefined}>
              <Preview pattern={pattern} label="Your pattern" height={460} />
            </div>
          ) : (
            <div className="flex h-[460px] items-center justify-center rounded-xl border-2 border-dashed border-hoop-dark/50 bg-linen font-semibold">
              Stitching your pattern…
            </div>
          )}
          {error && (
            <p role="alert" className="mt-3 font-semibold text-madder">
              {error}
            </p>
          )}
        </div>
      </div>
      {pattern && (
        <div className="mt-6 rounded-xl border-2 border-dashed border-hoop-dark/50 bg-linen p-4">
          <h2 className="font-serif text-xl font-bold">Colour key</h2>
          <div className="mt-2">
            <ColorKey palette={pattern.palette} />
          </div>
        </div>
      )}
    </div>
  );
}

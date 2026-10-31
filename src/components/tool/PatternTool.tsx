"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Uploader } from "./Uploader";
import { Cropper } from "./Cropper";
import { Settings } from "./Settings";
import { Preview } from "./Preview";
import { ColorKey } from "./ColorKey";
import { SizePanel } from "./SizePanel";
import { defaultPaper, ExportPanel } from "./ExportPanel";
import { BeforeAfter } from "./BeforeAfter";
import type { Paper } from "@/lib/pdf/buildPdf";
import { DEFAULT_SETTINGS, type Pattern, type PatternSettings } from "@/lib/pattern/pipeline";
import { cropSource, loadFile, loadSource, runPattern, type CropRect, type SourceImage } from "@/lib/pattern/runner";
import type { FabricCount } from "@/lib/pattern/fabric";
import { applyEdits, type ColourEdit } from "@/lib/pattern/edit";
import { clearProject, encodeSource, loadProject, saveProject, type SavedProject } from "@/lib/storage/project";

type Step = "upload" | "crop" | "pattern";

// "Optimise for a face": at least this many stitches wide, and this many colours
const OPTIMISED_WIDTH = 120;
const OPTIMISED_COLOURS = 30;

const ACCEPTED = /^image\/(jpeg|png|webp|heic|heif)$/i;

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border-2 border-dashed border-hoop-dark/50 bg-linen p-4">
      <h2 className="mb-3 font-serif text-lg font-bold">{title}</h2>
      {children}
    </section>
  );
}

export default function PatternTool() {
  const [step, setStep] = useState<Step>("upload");
  const [source, setSource] = useState<SourceImage | null>(null);
  const [sourceBlob, setSourceBlob] = useState<Blob | null>(null);
  const [crop, setCrop] = useState<CropRect | undefined>();
  const [cropped, setCropped] = useState<SourceImage | null>(null);
  const [settings, setSettings] = useState<PatternSettings>(DEFAULT_SETTINGS);
  const [fabric, setFabric] = useState<FabricCount>(14);
  const [paper, setPaper] = useState<Paper>(defaultPaper);
  // Shows the "crop closer" hint after "Optimise for a face", until a new photo
  const [optimised, setOptimised] = useState(false);
  const [edits, setEdits] = useState<ColourEdit[]>([]);
  const [base, setBase] = useState<Pattern | null>(null);
  const [saved, setSaved] = useState<SavedProject | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "working">("idle");
  const [error, setError] = useState<string | null>(null);
  const runId = useRef(0);

  const pattern = useMemo(() => (base ? applyEdits(base, edits) : null), [base, edits]);

  useEffect(() => {
    loadProject().then(setSaved);
  }, []);

  const openSource = (src: SourceImage, blob: Blob | null) => {
    setSource(src);
    setSourceBlob(blob);
    setCrop(undefined);
    setBase(null);
    setEdits([]);
    setOptimised(false);
    setStep("crop");
    if (!blob) encodeSource(src).then(setSourceBlob).catch(() => setSourceBlob(null));
  };

  const onFile = async (file: File) => {
    setError(null);
    if (!ACCEPTED.test(file.type) && !/\.hei[cf]$/i.test(file.name)) {
      setError("That file isn't a photo we can read. Try a JPG, PNG, WebP or HEIC image.");
      return;
    }
    setStatus("loading");
    try {
      openSource(await loadFile(file), null);
    } catch {
      setError("Sorry, that photo couldn't be opened. Try saving it as a JPG first.");
    } finally {
      setStatus("idle");
    }
  };

  const restore = async (p: SavedProject) => {
    setStatus("loading");
    try {
      const src = await loadSource(p.source);
      setSource(src);
      setSourceBlob(p.source);
      setCrop(p.crop);
      setCropped(cropSource(src, p.crop));
      setSettings({ ...DEFAULT_SETTINGS, ...p.settings });
      setFabric(p.fabric);
      setEdits(p.edits);
      setBase(null);
      setStep("pattern");
    } catch {
      setError("Your last pattern couldn't be opened. Please start a new one.");
      clearProject();
      setSaved(null);
    } finally {
      setStatus("idle");
    }
  };

  // Re-run the pipeline when the crop or settings change. Slider drags are
  // debounced, and results from older runs are ignored.
  useEffect(() => {
    if (!cropped) return;
    const id = ++runId.current;
    const t = setTimeout(() => {
      setStatus("working");
      runPattern(cropped, settings)
        .then(({ pattern: p }) => {
          if (id === runId.current) setBase(p);
        })
        .catch(() => id === runId.current && setError("Something went wrong making the pattern. Please try again."))
        .finally(() => id === runId.current && setStatus("idle"));
    }, 200);
    return () => clearTimeout(t);
  }, [cropped, settings]);

  // Auto-save the current project on this device.
  useEffect(() => {
    if (step !== "pattern" || !sourceBlob || !crop) return;
    const t = setTimeout(() => {
      const p: SavedProject = { version: 1, savedAt: Date.now(), source: sourceBlob, crop, settings, fabric, edits };
      saveProject(p);
      setSaved(p);
    }, 600);
    return () => clearTimeout(t);
  }, [step, sourceBlob, crop, settings, fabric, edits]);

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
        {saved && status !== "loading" && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm">
            <button
              onClick={() => restore(saved)}
              className="rounded-lg border-2 border-dashed border-madder px-4 py-2 font-semibold text-madder hover:bg-aida-deep"
            >
              Continue your last pattern
            </button>
            <span className="text-muted">
              saved {new Date(saved.savedAt).toLocaleDateString(undefined, { day: "numeric", month: "short" })} on this device
            </span>
          </div>
        )}
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
        <div className="space-y-5">
          <Panel title="Settings">
            <Settings
              value={settings}
              onChange={setSettings}
              fabric={fabric}
              onFabricChange={setFabric}
              aspect={cropped ? cropped.height / cropped.width : undefined}
            />
          </Panel>
          {pattern && (
            <Panel title="Size">
              <SizePanel width={pattern.width} height={pattern.height} fabric={fabric} />
            </Panel>
          )}
        </div>
        {/* On phones the preview comes first, so the pattern is visible right after cropping. */}
        <div className="order-first min-w-0 space-y-5 md:order-none">
          {pattern && settings.width < 100 && (settings.portrait || pattern.faceLikely) && (
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border-2 border-dashed border-mustard bg-linen px-3 py-2 text-sm">
              <span>
                <strong>Tip:</strong> Faces look better at 100+ stitches.
              </span>
              <button
                onClick={() => setSettings({ ...settings, width: 100 })}
                className="font-semibold text-madder underline underline-offset-2"
              >
                Use 100 stitches
              </button>
              {!settings.portrait && (
                <button
                  onClick={() => setSettings({ ...settings, portrait: true })}
                  className="font-semibold text-madder underline underline-offset-2"
                >
                  Turn on Portrait mode
                </button>
              )}
              <button
                onClick={() => {
                  setSettings({
                    ...settings,
                    portrait: true,
                    simplifyBackground: true,
                    // Faces stitch best as calm areas of colour
                    dither: false,
                    cleanup: true,
                    width: Math.max(settings.width, OPTIMISED_WIDTH),
                    maxColours: OPTIMISED_COLOURS,
                  });
                  setOptimised(true);
                }}
                className="rounded-md bg-madder px-2.5 py-1 font-semibold text-linen hover:bg-madder-dark"
              >
                Optimise for a face
              </button>
            </p>
          )}
          {optimised && (
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border-2 border-dashed border-sage bg-linen px-3 py-2 text-sm">
              <span>Optimised for a face. Crop closer to the face for more detail.</span>
              <button onClick={() => setStep("crop")} className="font-semibold text-madder underline underline-offset-2">
                Adjust crop
              </button>
            </p>
          )}
          {pattern && cropped && <BeforeAfter photo={cropped} pattern={pattern} />}
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
            <p role="alert" className="font-semibold text-madder">
              {error}
            </p>
          )}
          {pattern && (
            <Panel title="Download">
              <ExportPanel pattern={pattern} fabric={fabric} paper={paper} onPaperChange={setPaper} />
            </Panel>
          )}
        </div>
      </div>
      {pattern && (
        <div className="mt-5">
          <Panel title="Colour key and shopping list">
            <ColorKey
              palette={pattern.palette}
              fabric={fabric}
              edited={edits.length > 0}
              onReset={() => setEdits([])}
              onMerge={(from, into) => setEdits((e) => [...e, { type: "merge", from, into }])}
              onSwap={(from, to) => setEdits((e) => [...e, { type: "swap", from, to }])}
            />
          </Panel>
        </div>
      )}
    </div>
  );
}

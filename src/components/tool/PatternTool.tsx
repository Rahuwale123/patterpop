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
import { FABRIC_COUNTS, type FabricCount } from "@/lib/pattern/fabric";
import { brandPalette } from "@/lib/pattern/palettes";
import { CRAFTS, type CraftId, type Gauge } from "@/lib/crafts";
import { applyEdits, type ColourEdit } from "@/lib/pattern/edit";
import { clearProject, encodeSource, loadProject, saveProject, type SavedProject } from "@/lib/storage/project";

type Step = "upload" | "crop" | "pattern";

// "Optimise for a face": at least this many stitches wide, and this many colours
// (capped to what each craft allows)
const OPTIMISED_WIDTH = 120;
const OPTIMISED_COLOURS = 30;
// Below this width the face tip shows
const FACE_TIP_WIDTH = 100;

const PRESETS: Record<CraftId, { label: string; width: number }[]> = {
  "cross-stitch": [
    { label: "Simple", width: 60 },
    { label: "Detailed", width: 100 },
    { label: "Very detailed", width: 150 },
  ],
  diamond: [
    { label: "Small", width: 60 },
    { label: "Medium", width: 100 },
    { label: "Large", width: 150 },
  ],
  perler: [
    { label: "1 board", width: 29 },
    { label: "2 boards", width: 58 },
    { label: "3 boards", width: 87 },
  ],
  crochet: [
    { label: "Small", width: 40 },
    { label: "Medium", width: 80 },
    { label: "Large", width: 120 },
  ],
  knitting: [
    { label: "Small", width: 40 },
    { label: "Medium", width: 80 },
    { label: "Large", width: 120 },
  ],
};

const capitalise = (s: string) => s[0].toUpperCase() + s.slice(1);

const ACCEPTED = /^image\/(jpeg|png|webp|heic|heif)$/i;

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border-2 border-dashed border-hoop-dark/50 bg-linen p-4">
      <h2 className="mb-3 font-serif text-lg font-bold">{title}</h2>
      {children}
    </section>
  );
}

export default function PatternTool({ craft = "cross-stitch" }: { craft?: CraftId }) {
  const C = CRAFTS[craft];
  const [step, setStep] = useState<Step>("upload");
  const [source, setSource] = useState<SourceImage | null>(null);
  const [sourceBlob, setSourceBlob] = useState<Blob | null>(null);
  const [crop, setCrop] = useState<CropRect | undefined>();
  const [cropped, setCropped] = useState<SourceImage | null>(null);
  const [settings, setSettings] = useState<PatternSettings>(() => ({
    ...DEFAULT_SETTINGS,
    palette: C.palette,
    width: C.width.default,
    maxColours: C.colours.default,
  }));
  const [fabric, setFabric] = useState<FabricCount>(14);
  const [gauge, setGauge] = useState<Gauge>(C.defaultGauge ?? { sts: 20, rows: 20 });
  const ctx = useMemo(() => ({ fabric, gauge }), [fabric, gauge]);
  // What actually goes to the pipeline: the craft decides the colours and cell shape.
  const runSettings = useMemo(
    () => ({ ...settings, palette: C.palette, cellAspect: C.cellAspect(ctx) }),
    [settings, C, ctx],
  );
  const [paper, setPaper] = useState<Paper>(defaultPaper);
  // Shows the "crop closer" hint after "Optimise for a face", until a new photo
  const [optimised, setOptimised] = useState(false);
  const [edits, setEdits] = useState<ColourEdit[]>([]);
  const [base, setBase] = useState<Pattern | null>(null);
  const [saved, setSaved] = useState<SavedProject | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "working">("idle");
  const [error, setError] = useState<string | null>(null);
  const runId = useRef(0);

  const pattern = useMemo(() => (base ? applyEdits(base, edits, C.palette) : null), [base, edits, C.palette]);

  useEffect(() => {
    loadProject(craft).then(setSaved);
  }, [craft]);

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
      if (p.gauge) setGauge(p.gauge);
      setEdits(p.edits);
      setBase(null);
      setStep("pattern");
    } catch {
      setError("Your last pattern couldn't be opened. Please start a new one.");
      clearProject(craft);
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
      runPattern(cropped, runSettings)
        .then(({ pattern: p }) => {
          if (id === runId.current) setBase(p);
        })
        .catch(() => id === runId.current && setError("Something went wrong making the pattern. Please try again."))
        .finally(() => id === runId.current && setStatus("idle"));
    }, 200);
    return () => clearTimeout(t);
  }, [cropped, runSettings]);

  // Auto-save the current project on this device.
  useEffect(() => {
    if (step !== "pattern" || !sourceBlob || !crop) return;
    const t = setTimeout(() => {
      const p: SavedProject = { version: 1, savedAt: Date.now(), source: sourceBlob, crop, settings, fabric, gauge, edits };
      saveProject(craft, p);
      setSaved(p);
    }, 600);
    return () => clearTimeout(t);
  }, [step, sourceBlob, crop, settings, fabric, gauge, edits, craft]);

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

  const sizeControls =
    C.sizing === "fabric" ? (
      <div>
        <label htmlFor="set-fabric" className="text-sm font-semibold">
          Fabric count (stitches per inch)
        </label>
        <select
          id="set-fabric"
          value={fabric}
          onChange={(e) => setFabric(Number(e.currentTarget.value) as FabricCount)}
          aria-describedby="set-fabric-help"
          className="mt-1 w-full rounded-md border border-charcoal/30 bg-linen px-2 py-1.5"
        >
          {FABRIC_COUNTS.map((c) => (
            <option key={c} value={c}>
              {c}-count Aida
            </option>
          ))}
        </select>
        <p id="set-fabric-help" className="mt-1 text-xs text-muted">
          Changes the finished size, not the detail.
        </p>
      </div>
    ) : C.sizing === "gauge" ? (
      <fieldset>
        <legend className="text-sm font-semibold">Your gauge (per 10 cm / 4 in)</legend>
        <div className="mt-1 grid grid-cols-2 gap-2">
          {(["sts", "rows"] as const).map((k) => (
            <label key={k} className="text-xs font-semibold">
              {k === "sts" ? (craft === "crochet" ? "Squares" : "Stitches") : "Rows"}
              <input
                type="number"
                inputMode="numeric"
                min={4}
                max={60}
                value={gauge[k]}
                onChange={(e) => {
                  const v = Number(e.currentTarget.value);
                  if (v >= 4 && v <= 60) setGauge({ ...gauge, [k]: v });
                }}
                className="mt-0.5 w-full rounded-md border border-charcoal/30 bg-linen px-2 py-1.5 text-sm font-normal"
              />
            </label>
          ))}
        </div>
        <p className="mt-1 text-xs text-muted">From a swatch or your yarn label. Sets the finished size and the chart shape.</p>
      </fieldset>
    ) : null;

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
              unitsPerInch={C.perInch(ctx)}
              rowsPerInch={C.sizing === "gauge" ? (gauge.rows / 10) * 2.54 : undefined}
              unitWord={C.unit.many}
              aspect={cropped ? cropped.height / cropped.width / C.cellAspect(ctx) : undefined}
              widthRange={{ min: C.width.min, max: C.width.max }}
              maxColours={C.colours.max}
              presets={PRESETS[craft]}
              sizeControls={sizeControls}
            />
          </Panel>
          {pattern && (
            <Panel title="Size">
              <SizePanel rows={C.sizeRows(pattern.width, pattern.height, ctx)} />
            </Panel>
          )}
        </div>
        {/* On phones the preview comes first, so the pattern is visible right after cropping. */}
        <div className="order-first min-w-0 space-y-5 md:order-none">
          {pattern && settings.width < Math.min(FACE_TIP_WIDTH, C.width.max) && (settings.portrait || pattern.faceLikely) && (
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border-2 border-dashed border-mustard bg-linen px-3 py-2 text-sm">
              <span>
                <strong>Tip:</strong> Faces look better at {Math.min(FACE_TIP_WIDTH, C.width.max)}+ {C.unit.many}.
              </span>
              <button
                onClick={() => setSettings({ ...settings, width: Math.min(FACE_TIP_WIDTH, C.width.max) })}
                className="font-semibold text-madder underline underline-offset-2"
              >
                Use {Math.min(FACE_TIP_WIDTH, C.width.max)} {C.unit.many}
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
                    width: Math.min(C.width.max, Math.max(settings.width, OPTIMISED_WIDTH)),
                    maxColours: Math.min(C.colours.max, OPTIMISED_COLOURS),
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
              <Preview pattern={pattern} label="Your pattern" height={460} style={C.style} />
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
              <ExportPanel
                pattern={pattern}
                paper={paper}
                onPaperChange={setPaper}
                fileKind={C.fileKind}
                pdf={{
                  title: C.pdfTitle,
                  details: [
                    ...C.sizeRows(pattern.width, pattern.height, ctx),
                    ["Colours", `${pattern.palette.length} colours`],
                    [capitalise(C.unit.many), pattern.palette.reduce((s, c) => s + c.count, 0).toLocaleString("en-US")],
                  ],
                  keyNote: C.keyNote(ctx),
                  codeLabel: C.codeLabel,
                  countLabel: capitalise(C.unit.many),
                  supply: C.supply && { label: C.supply.label, forCount: (n) => C.supply!.forCount(n, ctx) },
                  style: C.style,
                }}
              />
            </Panel>
          )}
        </div>
      </div>
      {pattern && (
        <div className="mt-5">
          <Panel title="Colour key and shopping list">
            <ColorKey
              palette={pattern.palette}
              swapColours={C.palette === "free" ? undefined : brandPalette(C.palette).colours}
              codeLabel={C.codeLabel}
              countLabel={capitalise(C.unit.many)}
              supply={C.supply && { label: C.supply.label, forCount: (n) => C.supply!.forCount(n, ctx) }}
              note={C.keyNote(ctx)}
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

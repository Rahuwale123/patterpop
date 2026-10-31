import clsx from "clsx";

type Props = {
  onFile?: (file: File) => void;
  disabled?: boolean;
  className?: string;
};

// Fabric stretched in an embroidery hoop. Rendered statically in the HTML as the
// tool placeholder, then reused by PatternTool once JS loads.
export function Uploader({ onFile, disabled, className }: Props) {
  return (
    <div className={clsx("mx-auto aspect-square w-full max-w-[340px]", className)}>
      <label
        className={clsx(
          "group relative flex h-full w-full items-center justify-center rounded-full",
          "border-[14px] border-hoop shadow-[inset_0_0_0_3px_var(--color-hoop-dark),0_0_0_3px_var(--color-hoop-dark)]",
          "hoop-fabric focus-within:outline focus-within:outline-3 focus-within:outline-offset-4 focus-within:outline-indigo",
          disabled ? "cursor-wait" : "cursor-pointer",
        )}
      >
        {/* Hoop screw */}
        <span
          aria-hidden="true"
          className="absolute -top-[26px] left-1/2 h-4 w-8 -translate-x-1/2 rounded-sm bg-hoop-dark"
        />
        <span className="flex flex-col items-center gap-2 px-8 text-center">
          <svg viewBox="0 0 24 24" className="h-9 w-9 text-madder" aria-hidden="true">
            <path
              d="M12 16V5M7 9.5 12 4.5l5 5M5 19.5h14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="font-serif text-xl font-bold">Drop a photo here</span>
          <span className="text-sm text-muted">or tap to choose one. JPG, PNG, WebP or HEIC.</span>
        </span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
          className="sr-only"
          disabled={disabled}
          aria-label="Choose a photo to turn into a cross stitch pattern"
          onChange={
            onFile
              ? (e) => {
                  const f = e.currentTarget.files?.[0];
                  if (f) onFile(f);
                }
              : undefined
          }
        />
      </label>
    </div>
  );
}

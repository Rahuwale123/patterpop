export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export function patternFilename(kind: string, width: number, height: number, ext: string): string {
  return `patternpop-${kind}-${width}x${height}.${ext}`;
}

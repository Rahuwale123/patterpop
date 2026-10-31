// Symbols that stay distinct when printed small in black and white. All are in
// the standard PDF Helvetica character set, so the PDF can draw them without
// embedding a font. Look-alikes are left out on purpose: no I/l/1/|, O/0/Q,
// S/5, Z/2, B/8, G/6, C/(, ' / ` / , / .
export const SYMBOLS: readonly string[] = [
  "+", "X", "O", "#", "/", "\\", "=", "%", "@", "&", "*", "?", "!", "$", "<", ">", "^", "~",
  "A", "D", "E", "F", "H", "K", "M", "N", "P", "R", "T", "U", "V", "W", "Y",
  "3", "4", "7", "9",
  "a", "b", "d", "e", "h", "k", "m", "n", "r", "s", "u", "w", "y",
];

export function assignSymbols(count: number): string[] {
  if (count > SYMBOLS.length) {
    throw new Error(`Only ${SYMBOLS.length} symbols available, ${count} requested`);
  }
  return SYMBOLS.slice(0, count);
}

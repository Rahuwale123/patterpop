import { describe, expect, it } from "vitest";
import { applyEdits } from "../edit";
import type { Pattern } from "../pipeline";

const base = (): Pattern => ({
  width: 3,
  height: 2,
  cells: Int16Array.from([0, 1, 2, 0, -1, 1]),
  palette: [
    { code: "310", name: "Black", hex: "#000000", symbol: "+", count: 2 },
    { code: "321", name: "Red", hex: "#C72B3B", symbol: "X", count: 2 },
    { code: "White", name: "White", hex: "#FCFBF8", symbol: "O", count: 1 },
  ],
});

describe("colour edits", () => {
  it("merges one colour into another and keeps symbols", () => {
    const p = applyEdits(base(), [{ type: "merge", from: "310", into: "White" }]);
    expect(p.palette.map((c) => c.code)).toEqual(["321", "White"]);
    expect(p.palette[1]).toMatchObject({ count: 3, symbol: "O" });
    expect(Array.from(p.cells)).toEqual([1, 0, 1, 1, -1, 0]);
  });

  it("swaps a colour for a different DMC floss", () => {
    const p = applyEdits(base(), [{ type: "swap", from: "321", to: "666" }]);
    expect(p.palette[1]).toMatchObject({ code: "666", symbol: "X", count: 2 });
    expect(Array.from(p.cells)).toEqual(Array.from(base().cells));
  });

  it("turns a swap to a colour already used into a merge", () => {
    const p = applyEdits(base(), [{ type: "swap", from: "321", to: "310" }]);
    expect(p.palette.map((c) => c.code)).toEqual(["310", "White"]);
    expect(p.palette[0].count).toBe(4);
  });

  it("ignores edits for colours that are gone", () => {
    const p = applyEdits(base(), [{ type: "merge", from: "999", into: "310" }]);
    expect(p).toEqual(base());
  });
});

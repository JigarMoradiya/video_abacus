// A direct port of Merge2048ViewModel.move()'s line-compaction algorithm (see
// iOS/Abacus/Main/Games/Merge 2048/Components/Merge2048ViewModel.swift) — not a
// reinterpretation. Same rule: a swipe walks each row/column from the wall inward, merges the
// first adjacent matching pair it finds (empty cells are skipped, not blockers — a NON-matching
// tile in between two equal tiles DOES block them), then repacks every survivor into
// consecutive cells starting at the wall.
//
// Used to build a real, persistent tile timeline for the marketing reel's sim — the reel
// script authors a sequence of swipes/spawns against ONE evolving board, and this function
// guarantees each step is computed exactly like the app would, not hand-traced.

export type Dir = "left" | "right" | "up" | "down";

export interface MTile {
  id: number;
  value: number;
  row: number;
  col: number;
}

export interface MoveResult {
  moved: boolean;
  /** the new tile list — survivors only, with updated positions/values */
  tiles: MTile[];
  /** where each ORIGINAL tile (by id, survivor or absorbed) ends up before it merges/vanishes */
  movedTo: Record<number, { row: number; col: number }>;
  /** ids that got absorbed into a survivor (and should fade out at the merge point) */
  absorbedIds: number[];
  /** survivor ids whose value just doubled (pop animation) */
  doubledIds: number[];
}

function linesFor(dir: Dir, size: number): [number, number][][] {
  const res: [number, number][][] = [];
  const range = (n: number) => Array.from({ length: n }, (_, i) => i);
  if (dir === "left") for (const r of range(size)) res.push(range(size).map((c) => [r, c]));
  if (dir === "right") for (const r of range(size)) res.push(range(size).reverse().map((c) => [r, c]));
  if (dir === "up") for (const c of range(size)) res.push(range(size).map((r) => [r, c]));
  if (dir === "down") for (const c of range(size)) res.push(range(size).reverse().map((r) => [r, c]));
  return res;
}

export function applyMove(tiles: MTile[], dir: Dir, size = 4): MoveResult {
  const grid: (MTile | null)[][] = Array.from({ length: size }, () => Array(size).fill(null));
  for (const t of tiles) grid[t.row][t.col] = t;

  const movedTo: Record<number, { row: number; col: number }> = {};
  const absorbedIds: number[] = [];
  const doubledIds: number[] = [];
  const finalTiles: MTile[] = [];
  let moved = false;

  for (const line of linesFor(dir, size)) {
    const lineTiles = line.map(([r, c]) => grid[r][c]).filter((t): t is MTile => t !== null);
    const seq: { survivor: MTile; absorbed?: MTile; mergedValue: number }[] = [];
    let i = 0;
    while (i < lineTiles.length) {
      if (i + 1 < lineTiles.length && lineTiles[i].value === lineTiles[i + 1].value) {
        seq.push({ survivor: lineTiles[i], absorbed: lineTiles[i + 1], mergedValue: lineTiles[i].value * 2 });
        i += 2;
      } else {
        seq.push({ survivor: lineTiles[i], mergedValue: lineTiles[i].value });
        i += 1;
      }
    }
    seq.forEach((s, idx) => {
      const [r, c] = line[idx];
      if (s.survivor.row !== r || s.survivor.col !== c) moved = true;
      movedTo[s.survivor.id] = { row: r, col: c };
      finalTiles.push({ id: s.survivor.id, value: s.mergedValue, row: r, col: c });
      if (s.absorbed) {
        movedTo[s.absorbed.id] = { row: r, col: c };
        absorbedIds.push(s.absorbed.id);
        doubledIds.push(s.survivor.id);
        moved = true;
      }
    });
  }

  return { moved, tiles: finalTiles, movedTo, absorbedIds, doubledIds };
}

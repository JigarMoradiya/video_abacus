// INTERNAL OVERFLOW GUARD. The stage's box guard only compares boxes with boxes; it cannot see a chip that sticks out of its own card.
// A card root attaches `useOverflowGuard(ref, "label")`: after layout it measures the card's LAYOUT boxes (offset* chain, which ignores the
// animated transforms) and throws when any descendant box, or any text that is wider than its own box, crosses the card's edge.
// Mark an element `data-guard-ignore` when it is meant to hang over the edge (a title pill straddling the top rim).
import { useLayoutEffect } from "react";

const rel = (el: HTMLElement, root: HTMLElement) => {
  let x = 0;
  let y = 0;
  let n: HTMLElement | null = el;
  while (n && n !== root) {
    x += n.offsetLeft;
    y += n.offsetTop;
    n = n.offsetParent as HTMLElement | null;
  }
  if (n !== root) return null;
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
};

export const checkOverflow = (root: HTMLElement, label: string, pad = 0, tol = 2): string | null => {
  const W = root.offsetWidth;
  const H = root.offsetHeight;
  for (const t of Array.from(root.querySelectorAll<HTMLElement>("[data-guard-title]"))) {
    if (t.offsetWidth > W - 8) return `"${label}": its title pill is ${t.offsetWidth}px wide inside a ${W}px card`;
  }
  const all = root.querySelectorAll<HTMLElement>("*");
  for (const el of Array.from(all)) {
    if (el.closest("[data-guard-ignore]")) continue;
    if (!(el instanceof HTMLElement) || el.offsetWidth === 0 || el.offsetHeight === 0) continue;
    const r = rel(el, root);
    if (!r) continue;
    if (r.x <= 1 && r.y <= 1 && r.w >= W - 2 && r.h >= H - 2) continue; // the content layer that simply fills the card
    if (el.children.length > 0 && r.w >= W - 2 * pad - 2 && r.w <= W + tol && r.x >= -tol) continue; // a full-width layout row: its children are checked instead
    if (r.x < pad - tol || r.y < pad - tol || r.x + r.w > W - pad + tol || r.y + r.h > H - pad + tol) {
      return `"${label}": <${el.tagName.toLowerCase()}> "${(el.textContent ?? "").slice(0, 24)}" [${Math.round(r.x)},${Math.round(r.y)} ${r.w}x${r.h}] crosses its card edge (${W}x${H})`;
    }
    if (el.scrollWidth > el.clientWidth + tol && getComputedStyle(el).overflow !== "visible" ) {
      return `"${label}": text "${(el.textContent ?? "").slice(0, 24)}" is clipped inside its box`;
    }
  }
  return null;
};

export const useOverflowGuard = (ref: React.RefObject<HTMLElement | null>, label: string, pad = 0, enabled = true) => {
  useLayoutEffect(() => {
    if (!enabled || !ref.current) return;
    const msg = checkOverflow(ref.current, label, pad);
    if (msg) throw new Error(`overflow: ${msg}`);
  });
};

"use client";
/**
 * Cursor state is declared in markup with data attributes, so any component
 * can opt in without wiring:
 *   data-cursor="view|visit|drag|magnetic|text|hide"
 *   data-cursor-label="Custom label"
 * Anchors with target="_blank" default to "visit"; buttons default to "magnetic".
 */
export type CursorKind = "default" | "magnetic" | "view" | "visit" | "drag" | "text" | "hide";

export type CursorState = {
  kind: CursorKind;
  label: string;
  target: HTMLElement | null;
  pressed: boolean;
};

export function resolveCursor(el: Element | null): Omit<CursorState, "pressed"> {
  const node = el?.closest<HTMLElement>("[data-cursor], a, button, [role='button'], input, textarea, select, label");
  if (!node) return { kind: "default", label: "", target: null };
  const declared = node.dataset.cursor as CursorKind | undefined;
  const label = node.dataset.cursorLabel ?? "";
  if (declared) return { kind: declared, label: label || defaultLabel(declared), target: node };
  if (node.matches("input, textarea, select")) return { kind: "text", label: "", target: node };
  if (node.matches("a[target='_blank']")) return { kind: "visit", label: label || "Visit", target: node };
  return { kind: "magnetic", label: "", target: node };
}

function defaultLabel(kind: CursorKind) {
  switch (kind) {
    case "view": return "View";
    case "visit": return "Visit";
    case "drag": return "Drag";
    default: return "";
  }
}

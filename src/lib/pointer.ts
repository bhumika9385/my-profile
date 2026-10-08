"use client";
/**
 * Single global pointer tracker shared by every WebGL scene, so canvases can
 * sit behind DOM content (pointer-events: none) and still react.
 * x/y are normalised device coords (-1..1); speed is a smoothed 0..1 value
 * that the scenes decay each frame.
 */
export const pointer = { x: 0, y: 0, cx: -1, cy: -1, px: 0, py: 0, speed: 0, active: 0, moved: false };

let bound = false;
export function bindPointer() {
  if (bound || typeof window === "undefined") return;
  bound = true;
  window.addEventListener(
    "pointermove",
    (e) => {
      pointer.cx = e.clientX;
      pointer.cy = e.clientY;
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
      pointer.moved = true;
      pointer.active = 1;
    },
    { passive: true },
  );
  document.documentElement.addEventListener("pointerleave", () => { pointer.active = 0; });
}

/** Call once per frame from a scene: updates and returns the smoothed velocity. */
export function samplePointer(delta: number) {
  const dx = pointer.x - pointer.px;
  const dy = pointer.y - pointer.py;
  pointer.px = pointer.x;
  pointer.py = pointer.y;
  const inst = Math.min(Math.hypot(dx, dy) / Math.max(delta, 1 / 240) / 6, 1);
  pointer.speed += (inst - pointer.speed) * (inst > pointer.speed ? 0.25 : 0.04);
  return pointer.speed;
}

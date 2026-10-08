"use client";

export default function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="label bg-paper px-4 py-3 text-ink transition-colors hover:bg-signal">
      Print / Save as PDF
    </button>
  );
}

/** Visible only in development — flags content that still needs real data. */
export default function DevNotice({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === "production") return null;
  return (
    <p role="note" className="label max-w-sm border border-dashed border-signal/60 px-3 py-2 normal-case tracking-normal text-signal">
      <span className="uppercase tracking-[0.12em]">Dev</span> — {children}
    </p>
  );
}

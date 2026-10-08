"use client";
import { useEffect, useState } from "react";
import { scrollToTarget } from "@/lib/scroll";
import MagneticButton from "@/components/ui/MagneticButton";

export default function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(window.scrollY > window.innerHeight * 0.8);
    window.addEventListener("scroll", on, { passive: true });
    on();
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <div className={`fixed bottom-6 right-6 z-[90] transition-all duration-500 ${show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"}`}>
      <MagneticButton>
        <button
          type="button"
          onClick={() => scrollToTarget("#top")}
          aria-label="Back to top"
          tabIndex={show ? 0 : -1}
          className="flex h-12 w-12 items-center justify-center rounded-full text-white shadow-[0_10px_30px_-8px_rgb(255_46_61/0.8)]"
          style={{ background: "var(--grad)" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 19V5M5 12l7-7 7 7" /></svg>
        </button>
      </MagneticButton>
    </div>
  );
}

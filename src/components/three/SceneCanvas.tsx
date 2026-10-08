"use client";
import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { tierConfig, type Tier } from "@/lib/device";

type Props = {
  tier: Tier;
  /** pause the render loop entirely when false (off-screen) */
  active: boolean;
  camera?: { position: [number, number, number]; fov?: number };
  children: React.ReactNode;
  className?: string;
};

/**
 * Shared R3F canvas: tier-based DPR, adaptive resolution under load,
 * render loop paused when off-screen, no antialias (points don't need it).
 */
export default function SceneCanvas({ tier, active, camera = { position: [0, 0, 6.5], fov: 40 }, children, className }: Props) {
  const cfg = tierConfig[tier];
  const [dpr, setDpr] = useState(cfg.dpr[1]);

  return (
    <Canvas
      className={className}
      dpr={dpr}
      frameloop={active ? "always" : "never"}
      camera={{ position: camera.position, fov: camera.fov ?? 40, near: 0.1, far: 60 }}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance", stencil: false, depth: false }}
      style={{ pointerEvents: "none" }}
    >
      <PerformanceMonitor
        onDecline={() => setDpr((d) => Math.max(cfg.dpr[0], d - 0.25))}
        onIncline={() => setDpr((d) => Math.min(cfg.dpr[1], d + 0.25))}
      />
      <Suspense fallback={null}>{children}</Suspense>
    </Canvas>
  );
}

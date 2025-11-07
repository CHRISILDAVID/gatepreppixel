import { useState } from "react";

interface CRTEffectProps {
  intensity?: "subtle" | "medium" | "strong";
  enabled?: boolean;
}

export function CRTEffect({ intensity = "subtle", enabled = true }: CRTEffectProps) {
  if (!enabled) return null;

  const intensityClasses = {
    subtle: "opacity-[0.03]",
    medium: "opacity-[0.06]",
    strong: "opacity-[0.12]",
  };

  return (
    <>
      {/* Scanlines */}
      <div
        className={`fixed inset-0 pointer-events-none z-[9999] ${intensityClasses[intensity]}`}
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            rgba(0, 0, 0, 0.15),
            rgba(0, 0, 0, 0.15) 1px,
            transparent 1px,
            transparent 2px
          )`,
          backgroundSize: "100% 4px",
        }}
      />

      {/* Screen flicker */}
      <div
        className={`fixed inset-0 pointer-events-none z-[9998] bg-white ${intensityClasses[intensity]} animate-pulse`}
        style={{ animationDuration: "0.1s", animationIterationCount: "infinite" }}
      />

      {/* Vignette effect */}
      <div
        className="fixed inset-0 pointer-events-none z-[9997]"
        style={{
          background: `radial-gradient(circle, transparent 60%, rgba(0,0,0,0.3) 100%)`,
        }}
      />

      {/* Screen curvature (subtle distortion) */}
      <div
        className={`fixed inset-0 pointer-events-none z-[9996] ${intensityClasses[intensity]}`}
        style={{
          background: `radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.1) 100%)`,
        }}
      />
    </>
  );
}

// Toggle control component
export function CRTToggle() {
  const [enabled, setEnabled] = useState(() => {
    const saved = localStorage.getItem("crt-effect-enabled");
    return saved ? JSON.parse(saved) : false;
  });

  const [intensity, setIntensity] = useState<"subtle" | "medium" | "strong">(() => {
    const saved = localStorage.getItem("crt-effect-intensity");
    return (saved as "subtle" | "medium" | "strong") || "subtle";
  });

  const handleToggle = () => {
    const newState = !enabled;
    setEnabled(newState);
    localStorage.setItem("crt-effect-enabled", JSON.stringify(newState));
  };

  const handleIntensityChange = () => {
    const intensities: Array<"subtle" | "medium" | "strong"> = ["subtle", "medium", "strong"];
    const currentIndex = intensities.indexOf(intensity);
    const nextIntensity = intensities[(currentIndex + 1) % intensities.length];
    setIntensity(nextIntensity);
    localStorage.setItem("crt-effect-intensity", nextIntensity);
  };

  return (
    <>
      <CRTEffect intensity={intensity} enabled={enabled} />
      
      {/* Control Panel */}
      <div className="fixed bottom-4 right-4 z-[10000] flex flex-col gap-2">
        <button
          onClick={handleToggle}
          className="px-3 py-2 text-xs font-pixel-readable bg-background border-2 border-foreground shadow-pixel hover:shadow-pixel-sm active:translate-x-[2px] active:translate-y-[2px] transition-all"
          title="Toggle CRT Effect"
        >
          CRT: {enabled ? "ON" : "OFF"}
        </button>
        
        {enabled && (
          <button
            onClick={handleIntensityChange}
            className="px-3 py-2 text-xs font-pixel-readable bg-background border-2 border-foreground shadow-pixel hover:shadow-pixel-sm active:translate-x-[2px] active:translate-y-[2px] transition-all"
            title="Change CRT Intensity"
          >
            {intensity.toUpperCase()}
          </button>
        )}
      </div>
    </>
  );
}

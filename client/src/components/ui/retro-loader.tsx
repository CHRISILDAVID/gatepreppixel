import { useEffect, useState } from "react";

interface RetroLoaderProps {
  text?: string;
  subtext?: string;
}

export function RetroLoader({ text = "LOADING", subtext = "PLEASE WAIT..." }: RetroLoaderProps) {
  const [dots, setDots] = useState("");
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 300);

    const frameInterval = setInterval(() => {
      setFrame((prev) => (prev + 1) % 4);
    }, 150);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(frameInterval);
    };
  }, []);

  const spinnerFrames = ["◢", "◣", "◤", "◥"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 p-8 border-4 border-foreground bg-background shadow-pixel-lg">
        {/* Spinner */}
        <div className="text-6xl font-pixel text-primary animate-bounce-pixel">
          {spinnerFrames[frame]}
        </div>

        {/* Loading text */}
        <div className="flex flex-col items-center gap-2">
          <div className="text-2xl font-pixel tracking-wider text-foreground">
            {text}
            <span className="inline-block w-12 text-left">{dots}</span>
          </div>
          
          {subtext && (
            <div className="text-sm font-pixel-readable text-muted-foreground">
              {subtext}
            </div>
          )}
        </div>

        {/* Pixel art progress bar */}
        <div className="w-64 h-6 border-2 border-foreground bg-background p-1">
          <div className="h-full bg-primary animate-pulse" style={{ width: "100%" }} />
        </div>

        {/* Retro style message */}
        <div className="text-xs font-pixel-mono text-muted-foreground opacity-60">
          &gt; INITIALIZING SYSTEM_
        </div>
      </div>
    </div>
  );
}

// Compact inline loader
export function InlinePixelLoader({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % 4);
    }, 150);
    return () => clearInterval(interval);
  }, []);

  const spinnerFrames = ["◢", "◣", "◤", "◥"];
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  };

  return (
    <span className={`inline-block font-pixel text-primary ${sizeClasses[size]}`}>
      {spinnerFrames[frame]}
    </span>
  );
}

// 8-bit style loading bar
interface PixelProgressBarProps {
  progress: number;
  className?: string;
  showPercentage?: boolean;
}

export function PixelProgressBar({ 
  progress, 
  className = "", 
  showPercentage = true 
}: PixelProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));
  
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {showPercentage && (
        <div className="text-xs font-pixel-mono text-right text-muted-foreground">
          {Math.round(clampedProgress)}%
        </div>
      )}
      <div className="relative h-6 border-2 border-foreground bg-background">
        <div 
          className="h-full bg-success transition-all duration-300 relative overflow-hidden"
          style={{ width: `${clampedProgress}%` }}
        >
          {/* Animated scanline effect on progress bar */}
          <div className="absolute inset-0 opacity-30 bg-gradient-to-b from-white via-transparent to-transparent animate-pulse" />
        </div>
        
        {/* Pixel segments overlay */}
        <div className="absolute inset-0 flex">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 border-r border-foreground/20 last:border-r-0"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

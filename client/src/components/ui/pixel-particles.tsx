import { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  velocityX: number;
  velocityY: number;
  life: number;
}

interface PixelParticlesProps {
  x: number;
  y: number;
  count?: number;
  colors?: string[];
  onComplete?: () => void;
}

export function PixelParticles({ 
  x, 
  y, 
  count = 20, 
  colors = ["#00ffff", "#ff00ff", "#ffff00", "#00ff00", "#ff0000"],
  onComplete 
}: PixelParticlesProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Create initial particles
    const initialParticles: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      x,
      y,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      velocityX: (Math.random() - 0.5) * 8,
      velocityY: (Math.random() - 0.5) * 8 - 2,
      life: 1,
    }));

    setParticles(initialParticles);

    // Animate particles
    const interval = setInterval(() => {
      setParticles((prev) => {
        const updated = prev
          .map((p) => ({
            ...p,
            x: p.x + p.velocityX,
            y: p.y + p.velocityY,
            velocityY: p.velocityY + 0.3, // Gravity
            life: p.life - 0.02,
          }))
          .filter((p) => p.life > 0);

        if (updated.length === 0 && onComplete) {
          onComplete();
        }

        return updated;
      });
    }, 16);

    return () => clearInterval(interval);
  }, [x, y, count, colors, onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            opacity: particle.life,
            transform: "translate(-50%, -50%)",
            imageRendering: "pixelated",
            boxShadow: `0 0 ${particle.size}px ${particle.color}`,
          }}
        />
      ))}
    </div>
  );
}

// Hook to trigger particles
export function usePixelParticles() {
  const [particles, setParticles] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const triggerParticles = (x: number, y: number) => {
    const id = Date.now();
    setParticles((prev) => [...prev, { x, y, id }]);
  };

  const removeParticles = (id: number) => {
    setParticles((prev) => prev.filter((p) => p.id !== id));
  };

  return {
    particles,
    triggerParticles,
    removeParticles,
    ParticleContainer: () => (
      <>
        {particles.map((p) => (
          <PixelParticles
            key={p.id}
            x={p.x}
            y={p.y}
            onComplete={() => removeParticles(p.id)}
          />
        ))}
      </>
    ),
  };
}

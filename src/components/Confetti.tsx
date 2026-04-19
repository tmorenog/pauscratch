"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rot: number;
  vr: number;
  shape: "rect" | "circle";
  life: number;
}

const COLORS = [
  "#2563eb",
  "#a855f7",
  "#eab308",
  "#16a34a",
  "#dc2626",
  "#f97316",
  "#06b6d4",
  "#ec4899",
];

interface Props {
  /** Triggers a fresh confetti burst whenever this value changes (and is truthy). */
  trigger: string | number | null;
}

export function Confetti({ trigger }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);
  const lastTriggerRef = useRef<typeof trigger>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    if (!trigger || trigger === lastTriggerRef.current) return;
    lastTriggerRef.current = trigger;

    // Burst from two corners + center for a celebratory effect
    const w = window.innerWidth;
    const origins = [
      { x: w * 0.15, y: 80 },
      { x: w * 0.5, y: 60 },
      { x: w * 0.85, y: 80 },
    ];
    const newParticles: Particle[] = [];
    origins.forEach((o) => {
      for (let i = 0; i < 80; i++) {
        const angle = Math.random() * Math.PI - Math.PI / 2;
        const speed = 4 + Math.random() * 7;
        newParticles.push({
          x: o.x,
          y: o.y,
          vx: Math.cos(angle) * speed * (Math.random() < 0.5 ? -1 : 1),
          vy: Math.sin(angle) * speed - Math.random() * 4,
          size: 6 + Math.random() * 6,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          rot: Math.random() * Math.PI * 2,
          vr: (Math.random() - 0.5) * 0.4,
          shape: Math.random() < 0.5 ? "rect" : "circle",
          life: 1,
        });
      }
    });
    particlesRef.current.push(...newParticles);

    if (rafRef.current == null) {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;
      const tick = () => {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        const remaining: Particle[] = [];
        for (const p of particlesRef.current) {
          p.vy += 0.18; // gravity
          p.vx *= 0.995;
          p.x += p.vx;
          p.y += p.vy;
          p.rot += p.vr;
          p.life -= 0.005;
          if (p.life <= 0 || p.y > window.innerHeight + 40) continue;

          ctx.save();
          ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          if (p.shape === "rect") {
            ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size / 1.5);
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
          remaining.push(p);
        }
        particlesRef.current = remaining;
        if (remaining.length > 0) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          rafRef.current = null;
        }
      };
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [trigger]);

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 50,
      }}
    />
  );
}

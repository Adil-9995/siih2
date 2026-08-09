import { useEffect, useRef } from "react";

type Props = {
  /** Lower intensity for dashboards */
  subtle?: boolean;
};

type Node = { x: number; y: number; vx: number; vy: number };

/**
 * Layered futuristic background:
 * 1 dark gradient · 2 animated grid · 3 city silhouette · 4 particle network · 5 glow
 * Canvas layer is skipped entirely under prefers-reduced-motion.
 */
export function CyberBackground({ subtle = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let width = 0;
    let height = 0;
    let nodes: Node[] = [];

    const isMobile = window.innerWidth < 768;
    const density = subtle ? 9000 : 6500;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(isMobile ? 34 : 90, Math.round((width * height) / density));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const linkDist = isMobile ? 90 : 130;

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
      }

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i]!;
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j]!;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < linkDist) {
            const alpha = (1 - d / linkDist) * (subtle ? 0.12 : 0.24);
            ctx.strokeStyle = `rgba(0, 157, 255, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        ctx.fillStyle = `rgba(0, 217, 255, ${subtle ? 0.32 : 0.6})`;
        ctx.beginPath();
        ctx.arc(a.x, a.y, 1.3, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = window.requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [subtle]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Layer 1 — dark gradient */}
      <div className="absolute inset-0 bg-background" />
      <div
        className="absolute inset-0"
        style={{ background: "var(--gradient-hero)", opacity: subtle ? 0.5 : 1 }}
      />

      {/* Layer 2 — animated grid floor */}
      <div
        className="grid-fade animate-grid absolute inset-x-0 bottom-0 h-[60vh]"
        style={{
          opacity: subtle ? 0.25 : 0.5,
          maskImage: "linear-gradient(to top, black, transparent)",
          WebkitMaskImage: "linear-gradient(to top, black, transparent)",
          transform: "perspective(600px) rotateX(62deg)",
          transformOrigin: "bottom",
        }}
      />

      {/* Layer 3 — city silhouette */}
      <svg
        className="absolute inset-x-0 bottom-0 w-full"
        viewBox="0 0 1440 260"
        preserveAspectRatio="none"
        style={{ height: subtle ? "18vh" : "34vh", opacity: subtle ? 0.4 : 0.75 }}
      >
        <defs>
          <linearGradient id="siihCity" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0a2a4d" />
            <stop offset="100%" stopColor="#02040A" />
          </linearGradient>
        </defs>
        <g fill="url(#siihCity)" stroke="rgba(0,157,255,0.45)" strokeWidth="1">
          {[
            [0, 150, 70],
            [72, 100, 46],
            [120, 180, 60],
            [182, 70, 54],
            [238, 140, 80],
            [320, 40, 44],
            [366, 165, 66],
            [434, 110, 90],
            [526, 60, 50],
            [578, 145, 74],
            [654, 95, 58],
            [714, 175, 96],
            [812, 55, 48],
            [862, 130, 70],
            [934, 90, 60],
            [996, 160, 86],
            [1084, 45, 52],
            [1138, 135, 78],
            [1218, 100, 62],
            [1282, 170, 74],
            [1358, 120, 82],
          ].map(([x, top, w], i) => (
            <rect key={i} x={x} y={top} width={w} height={260 - (top as number)} rx="2" />
          ))}
        </g>
      </svg>

      {/* Layer 4 — particle network */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* Layer 5 — glow + scanline + readability overlay */}
      <div
        className="animate-pulse-glow absolute -top-32 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full blur-3xl"
        style={{ background: "oklch(0.66 0.19 240 / 0.18)" }}
      />
      <div
        className="animate-scanline absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, oklch(0.82 0.15 205 / 0.5), transparent)" }}
      />
      <div className="absolute inset-0 bg-background/55" />
    </div>
  );
}

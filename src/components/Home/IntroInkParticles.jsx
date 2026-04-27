import { useCallback, useEffect, useRef } from "react";

/**
 * 水墨粒子 — 源自 模仿/frontend InkParticles.tsx
 * @param {{ variant?: "viewport" | "layer" }} props viewport=全屏 fixed；layer=父级 absolute 铺满（首屏内）
 */
export default function IntroInkParticles({ variant = "viewport" }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animRef = useRef(0);
  const variantRef = useRef(variant);
  variantRef.current = variant;

  const createParticle = useCallback((w, h) => {
    const type = Math.random() > 0.3 ? "mist" : "ink";
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -Math.random() * 0.5 - 0.1,
      size: type === "ink" ? Math.random() * 3 + 1 : Math.random() * 40 + 20,
      opacity: 0,
      life: 0,
      maxLife: Math.random() * 300 + 200,
      type,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      if (variantRef.current === "layer" && canvas.parentElement) {
        const { clientWidth, clientHeight } = canvas.parentElement;
        canvas.width = Math.max(1, clientWidth);
        canvas.height = Math.max(1, clientHeight);
      } else {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    resize();
    window.addEventListener("resize", resize);
    const ro =
      variant === "layer" && canvas.parentElement
        ? new ResizeObserver(() => resize())
        : null;
    if (ro && canvas.parentElement) ro.observe(canvas.parentElement);

    const count = 35;
    particlesRef.current = Array.from({ length: count }, () => createParticle(canvas.width, canvas.height));
    particlesRef.current.forEach((p) => {
      p.life = Math.random() * p.maxLife;
    });

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((p, i) => {
        p.life += 1;
        if (p.life > p.maxLife) {
          particlesRef.current[i] = createParticle(canvas.width, canvas.height);
          return;
        }

        const progress = p.life / p.maxLife;
        if (progress < 0.15) {
          p.opacity = (progress / 0.15) * (p.type === "ink" ? 0.6 : 0.04);
        } else if (progress > 0.7) {
          p.opacity = ((1 - progress) / 0.3) * (p.type === "ink" ? 0.6 : 0.04);
        }

        p.x += p.vx;
        p.y += p.vy;
        p.x += Math.sin(p.life * 0.01) * 0.2;

        if (p.type === "ink") {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(55, 65, 81, ${p.opacity})`;
          ctx.fill();
        } else {
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
          gradient.addColorStop(0, `rgba(55, 65, 81, ${p.opacity})`);
          gradient.addColorStop(0.5, `rgba(55, 65, 81, ${p.opacity * 0.5})`);
          gradient.addColorStop(1, "rgba(55, 65, 81, 0)");
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        }
      });

      animRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      ro?.disconnect();
      cancelAnimationFrame(animRef.current);
    };
  }, [createParticle, variant]);

  const canvasClass =
    variant === "layer" ? "intro-ink-canvas intro-ink-canvas--layer" : "intro-ink-canvas";

  return <canvas ref={canvasRef} className={canvasClass} aria-hidden="true" />;
}

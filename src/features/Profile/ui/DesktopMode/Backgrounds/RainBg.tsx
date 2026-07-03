import { useEffect, useRef } from "react";

interface IRaindrop {
  x: number;
  y: number;
  len: number;
  speed: number;
  opacity: number;
}

interface ISplash {
  x: number;
  y: number;
  r: number;
  maxR: number;
  opacity: number;
}

export const RainBg = ({ isDark }: { isDark: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const drops: IRaindrop[] = Array.from({ length: 80 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height - height,
      len: Math.random() * 20 + 10,
      speed: Math.random() * 15 + 10,
      opacity: Math.random() * 0.4 + 0.1,
    }));

    const splashes: ISplash[] = [];

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    const draw = () => {
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      if (isDark) {
        bgGrad.addColorStop(0, "rgb(15, 23, 42)");
        bgGrad.addColorStop(1, "rgb(2, 6, 23)");
      } else {
        bgGrad.addColorStop(0, "rgb(224, 242, 254)");
        bgGrad.addColorStop(1, "rgb(241, 245, 249)");
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      ctx.lineWidth = 1.25;
      ctx.lineCap = "round";

      drops.forEach((drop) => {
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x + 0.8, drop.y + drop.len);
        ctx.strokeStyle = isDark
          ? `rgba(186, 230, 253, ${drop.opacity})`
          : `rgba(99, 102, 241, ${drop.opacity * 0.85})`;
        ctx.stroke();

        drop.y += drop.speed;
        drop.x += 0.8;

        if (drop.y > height - 20) {
          if (Math.random() > 0.4) {
            splashes.push({
              x: drop.x,
              y: height - 10 - Math.random() * 20,
              r: 1,
              maxR: Math.random() * 12 + 6,
              opacity: drop.opacity,
            });
          }
          drop.y = Math.random() * -50 - 20;
          drop.x = Math.random() * width;
        }
      });

      for (let i = splashes.length - 1; i >= 0; i--) {
        const s = splashes[i];
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.strokeStyle = isDark
          ? `rgba(186, 230, 253, ${s.opacity})`
          : `rgba(99, 102, 241, ${s.opacity})`;
        ctx.stroke();

        s.r += 0.5;
        s.opacity -= 0.02;

        if (s.opacity <= 0 || s.r >= s.maxR) {
          splashes.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDark]);

  return <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />;
};

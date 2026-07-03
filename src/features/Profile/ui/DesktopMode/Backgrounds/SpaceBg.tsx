import { useEffect, useRef } from "react";

interface IStar {
  x: number;
  y: number;
  z: number;
  size: number;
  color: string;
}

export const SpaceBg = ({ isDark }: { isDark: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const stars: IStar[] = Array.from({ length: 120 }, () => ({
      x: (Math.random() - 0.5) * 1000,
      y: (Math.random() - 0.5) * 1000,
      z: Math.random() * 1000,
      size: Math.random() * 1.5 + 0.5,
      color: isDark
        ? `rgba(${200 + Math.random() * 55}, ${200 + Math.random() * 55}, 255, ${0.5 + Math.random() * 0.5})`
        : `rgba(${120 + Math.random() * 50}, 100, 250, ${0.4 + Math.random() * 0.4})`,
    }));

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    const draw = () => {
      ctx.fillStyle = isDark ? "rgb(8, 4, 28)" : "rgb(243, 244, 252)";
      ctx.fillRect(0, 0, width, height);

      const grad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        0,
        width / 2,
        height / 2,
        Math.max(width, height)
      );

      if (isDark) {
        grad.addColorStop(0, "rgba(56, 18, 114, 0.45)");
        grad.addColorStop(0.5, "rgba(10, 4, 32, 0.9)");
        grad.addColorStop(1, "rgb(6, 2, 22)");
      } else {
        grad.addColorStop(0, "rgba(224, 231, 255, 0.9)");
        grad.addColorStop(0.5, "rgba(240, 244, 255, 0.7)");
        grad.addColorStop(1, "rgb(245, 247, 255)");
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      stars.forEach((star) => {
        star.z -= 0.65;
        if (star.z <= 0) {
          star.z = 1000;
          star.x = (Math.random() - 0.5) * 1000;
          star.y = (Math.random() - 0.5) * 1000;
        }

        const k = 400 / star.z;
        const px = star.x * k + cx;
        const py = star.y * k + cy;

        if (px >= 0 && px < width && py >= 0 && py < height) {
          const alpha = 1 - star.z / 1000;
          ctx.beginPath();
          ctx.arc(px, py, star.size * k * 0.45, 0, Math.PI * 2);
          ctx.fillStyle = star.color;
          ctx.shadowBlur = isDark ? 8 : 4;
          ctx.shadowColor = isDark ? "rgba(167, 139, 250, 0.6)" : "rgba(124, 58, 237, 0.3)";
          ctx.fill();
        }
      });

      ctx.shadowBlur = 0;
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

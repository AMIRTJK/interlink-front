import { useEffect, useRef } from "react";

interface IFirefly {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  maxOpacity: number;
}

export const MountainsBg = ({ isDark }: { isDark: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const fireflies: IFirefly[] = Array.from({ length: 30 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height * 0.7,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -(Math.random() * 0.3 + 0.1),
      size: Math.random() * 2 + 1,
      opacity: 0,
      maxOpacity: Math.random() * 0.6 + 0.2,
    }));

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    const drawMountains = (
      points: { x: number; y: number }[],
      color: string
    ) => {
      ctx.beginPath();
      ctx.moveTo(0, height);
      points.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    };

    const draw = () => {
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      if (isDark) {
        bgGrad.addColorStop(0, "rgb(6, 4, 18)");
        bgGrad.addColorStop(0.7, "rgb(23, 14, 52)");
        bgGrad.addColorStop(1, "rgb(42, 21, 78)");
      } else {
        bgGrad.addColorStop(0, "rgb(253, 230, 138)");
        bgGrad.addColorStop(0.6, "rgb(251, 146, 60)");
        bgGrad.addColorStop(1, "rgb(221, 74, 122)");
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      ctx.beginPath();
      ctx.arc(width * 0.75, height * 0.35, isDark ? 45 : 60, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? "rgba(254, 243, 199, 0.15)" : "rgba(254, 243, 199, 0.4)";
      ctx.shadowBlur = isDark ? 30 : 15;
      ctx.shadowColor = "rgba(251, 191, 36, 0.4)";
      ctx.fill();
      ctx.shadowBlur = 0;

      fireflies.forEach((f) => {
        f.x += f.vx;
        f.y += f.vy;

        if (f.y < -10) {
          f.y = height * 0.75;
          f.x = Math.random() * width;
          f.opacity = 0;
        }

        if (f.opacity < f.maxOpacity) {
          f.opacity += 0.005;
        }

        ctx.beginPath();
        ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? `rgba(253, 224, 71, ${f.opacity})`
          : `rgba(255, 255, 255, ${f.opacity})`;
        ctx.shadowBlur = 6;
        ctx.shadowColor = isDark ? "rgba(253, 224, 71, 0.8)" : "rgba(255, 255, 255, 0.8)";
        ctx.fill();
      });
      ctx.shadowBlur = 0;

      const backMountainPoints = [
        { x: 0, y: height * 0.75 },
        { x: width * 0.25, y: height * 0.58 },
        { x: width * 0.5, y: height * 0.72 },
        { x: width * 0.72, y: height * 0.55 },
        { x: width, y: height * 0.78 },
      ];
      drawMountains(
        backMountainPoints,
        isDark ? "rgb(15, 12, 38)" : "rgba(107, 33, 168, 0.65)"
      );

      const frontMountainPoints = [
        { x: 0, y: height * 0.85 },
        { x: width * 0.35, y: height * 0.68 },
        { x: width * 0.65, y: height * 0.82 },
        { x: width * 0.82, y: height * 0.65 },
        { x: width, y: height * 0.88 },
      ];
      drawMountains(
        frontMountainPoints,
        isDark ? "rgb(8, 6, 22)" : "rgba(88, 28, 135, 0.95)"
      );

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

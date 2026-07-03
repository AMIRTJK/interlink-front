import { useEffect, useRef } from "react";

export const AuroraBg = ({ isDark }: { isDark: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let time = 0;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    const drawAurora = (
      baseHeight: number,
      amplitude: number,
      frequency: number,
      speed: number,
      color1: string,
      color2: string
    ) => {
      ctx.beginPath();
      ctx.moveTo(0, height);

      for (let x = 0; x <= width; x += 10) {
        const yOffset =
          Math.sin(x * frequency + time * speed) *
          Math.cos(x * frequency * 0.5 + time * speed * 0.7) *
          amplitude;
        ctx.lineTo(x, baseHeight + yOffset);
      }

      ctx.lineTo(width, height);
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, baseHeight - amplitude, 0, height);
      grad.addColorStop(0, color1);
      grad.addColorStop(0.5, color2);
      grad.addColorStop(1, "transparent");

      ctx.fillStyle = grad;
      ctx.fill();
    };

    const draw = () => {
      time += 0.003;

      ctx.fillStyle = isDark ? "rgb(6, 4, 18)" : "rgb(243, 244, 252)";
      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = isDark ? "screen" : "multiply";

      if (isDark) {
        drawAurora(
          height * 0.4,
          75,
          0.002,
          0.95,
          "rgba(16, 185, 129, 0.28)",
          "rgba(6, 182, 212, 0.12)"
        );
        drawAurora(
          height * 0.48,
          95,
          0.0015,
          0.7,
          "rgba(139, 92, 246, 0.22)",
          "rgba(219, 39, 119, 0.08)"
        );
        drawAurora(
          height * 0.35,
          60,
          0.003,
          1.2,
          "rgba(34, 197, 94, 0.25)",
          "rgba(59, 130, 246, 0.1)"
        );
      } else {
        drawAurora(
          height * 0.42,
          85,
          0.0018,
          0.9,
          "rgba(244, 63, 94, 0.15)",
          "rgba(124, 58, 237, 0.08)"
        );
        drawAurora(
          height * 0.5,
          105,
          0.0012,
          0.6,
          "rgba(6, 182, 212, 0.18)",
          "rgba(245, 158, 11, 0.06)"
        );
        drawAurora(
          height * 0.38,
          70,
          0.0025,
          1.1,
          "rgba(16, 185, 129, 0.15)",
          "rgba(59, 130, 246, 0.12)"
        );
      }

      ctx.globalCompositeOperation = "source-over";

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

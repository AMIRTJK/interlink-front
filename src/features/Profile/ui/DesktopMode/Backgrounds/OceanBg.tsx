import { useEffect, useRef } from "react";

export const OceanBg = ({ isDark }: { isDark: boolean }) => {
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

    const drawWave = (
      baseY: number,
      amplitude: number,
      frequency: number,
      speed: number,
      color: string
    ) => {
      ctx.beginPath();
      ctx.moveTo(0, height);

      for (let x = 0; x <= width; x += 5) {
        const y = baseY + Math.sin(x * frequency + time * speed) * amplitude;
        ctx.lineTo(x, y);
      }

      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    };

    const draw = () => {
      time += 0.012;

      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      if (isDark) {
        bgGrad.addColorStop(0, "rgb(8, 10, 36)");
        bgGrad.addColorStop(0.6, "rgb(23, 27, 75)");
        bgGrad.addColorStop(1, "rgb(12, 14, 52)");
      } else {
        bgGrad.addColorStop(0, "rgb(224, 242, 254)");
        bgGrad.addColorStop(0.6, "rgb(186, 230, 253)");
        bgGrad.addColorStop(1, "rgb(125, 211, 252)");
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      if (isDark) {
        drawWave(
          height * 0.72,
          18,
          0.003,
          1.1,
          "rgba(49, 46, 129, 0.45)"
        );
        drawWave(
          height * 0.76,
          24,
          0.002,
          0.75,
          "rgba(30, 58, 138, 0.55)"
        );
        drawWave(
          height * 0.8,
          30,
          0.0015,
          0.45,
          "rgba(15, 23, 42, 0.85)"
        );
      } else {
        drawWave(
          height * 0.74,
          15,
          0.0035,
          1.2,
          "rgba(56, 189, 248, 0.4)"
        );
        drawWave(
          height * 0.78,
          20,
          0.0025,
          0.8,
          "rgba(14, 165, 233, 0.55)"
        );
        drawWave(
          height * 0.82,
          26,
          0.0018,
          0.5,
          "rgba(2, 132, 199, 0.8)"
        );
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

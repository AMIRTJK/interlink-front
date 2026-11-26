import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "../lib/prefersReducedMotion";

const GLYPHS = "01ABCDEF<>/{}[]=+*#$АБВГДЖЗИКЛМНПРСТФЦЧШЭЮЯ";
const FONT_SIZE = 16;
// Классическая «матрица» читается лучше на ~20 кадрах: на 60 символы мелькают.
const FRAME_INTERVAL_MS = 50;

const TRAIL_FADE = "rgba(0, 0, 0, 0.08)";

const THEME = {
  dark: { bg: "rgb(2, 8, 4)", glyph: "rgb(34, 197, 94)", head: "rgb(220, 252, 231)" },
  light: { bg: "rgb(240, 253, 244)", glyph: "rgb(21, 128, 61)", head: "rgb(5, 46, 22)" },
} as const;

const randomGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

// Колонки стартуют выше экрана на разную глубину, чтобы поток не начинался ровной линией.
const createDrops = (width: number, height: number) =>
  Array.from({ length: Math.ceil(width / FONT_SIZE) }, () =>
    Math.floor((Math.random() * -height) / FONT_SIZE),
  );

export const MatrixBg = ({ isDark }: { isDark: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const theme = isDark ? THEME.dark : THEME.light;
    let animationFrameId = 0;
    let lastFrameTime = 0;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let drops = createDrops(width, height);
    let headGlyphs: string[] = [];

    const setupFont = () => {
      ctx.font = `${FONT_SIZE}px monospace`;
    };

    // Смена размера canvas сбрасывает его содержимое и шрифт — колонки строим заново.
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      drops = createDrops(width, height);
      headGlyphs = [];
      setupFont();
    };

    window.addEventListener("resize", handleResize);

    const drawStep = () => {
      // Шлейф гасим стиранием альфы, а не заливкой цветом фона: заливка из-за округления
      // 8-битного цвета не доходит до фона и оставляет «призраки» символов. Фон — CSS под canvas.
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = TRAIL_FADE;
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = "source-over";

      drops.forEach((row, column) => {
        const x = column * FONT_SIZE;
        const y = row * FONT_SIZE;

        // Прошлую «голову» перекрашиваем тем же символом — иначе глифы накладываются.
        const previousHead = headGlyphs[column];
        if (previousHead) {
          ctx.clearRect(x, y - FONT_SIZE * 2, FONT_SIZE, FONT_SIZE + 4);
          ctx.fillStyle = theme.glyph;
          ctx.fillText(previousHead, x, y - FONT_SIZE);
        }

        const head = randomGlyph();
        headGlyphs[column] = head;
        ctx.fillStyle = theme.head;
        ctx.fillText(head, x, y);

        const isBelowScreen = y > height && Math.random() > 0.975;
        drops[column] = isBelowScreen ? 0 : row + 1;
      });
    };

    const drawStaticFrame = () => {
      ctx.fillStyle = theme.glyph;
      ctx.globalAlpha = 0.35;
      for (let x = 0; x < width; x += FONT_SIZE) {
        for (let y = FONT_SIZE; y < height; y += FONT_SIZE) {
          if (Math.random() > 0.7) ctx.fillText(randomGlyph(), x, y);
        }
      }
      ctx.globalAlpha = 1;
    };

    const loop = (time: number) => {
      if (time - lastFrameTime >= FRAME_INTERVAL_MS) {
        lastFrameTime = time;
        drawStep();
      }
      animationFrameId = requestAnimationFrame(loop);
    };

    setupFont();
    if (prefersReducedMotion()) drawStaticFrame();
    else animationFrameId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 block w-full h-full"
      style={{ backgroundColor: isDark ? THEME.dark.bg : THEME.light.bg }}
    />
  );
};

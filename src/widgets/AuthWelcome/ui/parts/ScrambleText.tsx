import { useRef, useState } from "react";
import { useAnimationFrame } from "framer-motion";

interface IProps {
  text: string;
  durationMs: number;
  delayMs?: number;
  className?: string;
}

const CHARSET = "АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЭЮЯ0123456789#%&@$";
const SAMPLE_MS = 55;

export const ScrambleText = ({
  text,
  durationMs,
  delayMs = 0,
  className = "",
}: IProps) => {
  const [output, setOutput] = useState(() => text.replace(/\S/g, "·"));
  const lastSampleRef = useRef(0);

  useAnimationFrame((elapsed) => {
    if (elapsed - lastSampleRef.current < SAMPLE_MS) return;
    lastSampleRef.current = elapsed;

    const local = elapsed - delayMs;
    if (local < 0) return;

    const ratio = Math.min(1, local / durationMs);
    const revealed = Math.floor(ratio * text.length);
    const tick = Math.floor(elapsed / SAMPLE_MS);

    const next = text
      .split("")
      .map((char, index) => {
        if (index < revealed || char === " ") return char;
        return CHARSET[(index * 7 + tick * 3) % CHARSET.length];
      })
      .join("");

    setOutput(next);
  });

  return <span className={className}>{output}</span>;
};

import { useMemo } from "react";

import { paragraphCss } from "../paragraphFormat";
import type { IParagraphFormat } from "../model";
import { Group } from "./ParagraphControls";

// Образец рисуем в НАСТОЯЩИХ единицах документа (см, пт, кегль холста) и целиком
// уменьшаем через transform: scale. Так пропорции отступов и интервалов совпадают
// с листом один в один — пересчитывать каждую величину в «масштаб превью» не нужно.
const SHEET_WIDTH = 620;
const SHEET_SCALE = 0.8;
const VIEW_HEIGHT = 148;

const FILLER_BEFORE = ["Предыдущий абзац", "Предыдущий абзац"];
const FILLER_AFTER = ["Следующий абзац", "Следующий абзац"];

const SAMPLE_TEXT =
  "Образец текста. Образец текста. Образец текста. Образец текста. Образец текста. " +
  "Образец текста. Образец текста. Образец текста. Образец текста. Образец текста. " +
  "Образец текста. Образец текста. Образец текста.";

const fillerText = (label: string) => `${label} ${label} ${label} ${label} ${label}`;

interface IProps {
  fmt: IParagraphFormat;
}

export const ParagraphSample = ({ fmt }: IProps) => {
  const sampleStyle = useMemo(() => paragraphCss(fmt), [fmt]);

  return (
    <Group title="Образец">
      <div
        className="mx-auto overflow-hidden rounded-lg border border-slate-100 bg-white dark:border-zinc-700 dark:bg-zinc-800"
        style={{ width: SHEET_WIDTH * SHEET_SCALE, height: VIEW_HEIGHT }}
      >
        <div
          aria-hidden="true"
          style={{
            width: SHEET_WIDTH,
            padding: "8px 12px",
            transform: `scale(${SHEET_SCALE})`,
            transformOrigin: "top left",
            fontFamily: "Times New Roman, serif",
            fontSize: 14,
            lineHeight: 1.4,
          }}
        >
          {FILLER_BEFORE.map((label, index) => (
            <p key={index} style={{ margin: 0, color: "#cbd5e1" }}>
              {fillerText(label)}
            </p>
          ))}
          <p style={{ ...sampleStyle, color: "#1e293b" }}>{SAMPLE_TEXT}</p>
          {FILLER_AFTER.map((label, index) => (
            <p key={index} style={{ margin: 0, color: "#cbd5e1" }}>
              {fillerText(label)}
            </p>
          ))}
        </div>
      </div>
    </Group>
  );
};

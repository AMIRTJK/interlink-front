import {
  LINE_MULTIPLE_STEP,
  LINE_PT_STEP,
  LINE_SPACING_OPTIONS,
  LINE_VALUE_MODES,
  MAX_LINE_MULTIPLE,
  MAX_LINE_PT,
  MAX_SPACING_PT,
  SPACING_STEP_PT,
  type IParagraphFormat,
  type TLineSpacingMode,
} from "../model";
import { Field, Group, NumberSpin } from "./ParagraphControls";
import { SelectBox } from "./SelectBox";

interface IProps {
  fmt: IParagraphFormat;
  onChange: (patch: Partial<IParagraphFormat>) => void;
}

// «Множитель» — безразмерное число, «Минимум»/«Точно» — пункты. Остальные режимы
// значения не имеют, поле гасим (как в Word).
const valueFieldOf = (
  mode: TLineSpacingMode,
): { unit?: string; step: number; max: number; decimals: number } =>
  mode === "multiple"
    ? { unit: undefined, step: LINE_MULTIPLE_STEP, max: MAX_LINE_MULTIPLE, decimals: 2 }
    : { unit: "пт", step: LINE_PT_STEP, max: MAX_LINE_PT, decimals: 2 };

// Смена режима подставляет осмысленное значение: множитель начинается с 1,
// «Минимум»/«Точно» — с высоты строки текущего кегля.
const valueForMode = (mode: TLineSpacingMode, current: number): number => {
  if (mode === "multiple") return current > 0 && current < 10 ? current : 1;
  if (mode === "atLeast" || mode === "exactly") return current >= 1 ? current : 12;
  return current;
};

export const ParagraphSpacingGroup = ({ fmt, onChange }: IProps) => {
  const valueField = valueFieldOf(fmt.lineMode);

  return (
    <Group title="Интервал">
      <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
        <Field label="Перед:" htmlFor="para-space-before">
          <NumberSpin
            id="para-space-before"
            value={fmt.spaceBefore}
            unit="пт"
            step={SPACING_STEP_PT}
            min={0}
            max={MAX_SPACING_PT}
            decimals={1}
            onChange={(spaceBefore) => onChange({ spaceBefore })}
          />
        </Field>
        <Field label="междустрочный:" htmlFor="para-line-mode">
          <SelectBox<TLineSpacingMode>
            id="para-line-mode"
            value={fmt.lineMode}
            options={LINE_SPACING_OPTIONS}
            onChange={(lineMode) =>
              onChange({
                lineMode,
                lineValue: valueForMode(lineMode, fmt.lineValue),
              })
            }
          />
        </Field>
        <Field label="После:" htmlFor="para-space-after">
          <NumberSpin
            id="para-space-after"
            value={fmt.spaceAfter}
            unit="пт"
            step={SPACING_STEP_PT}
            min={0}
            max={MAX_SPACING_PT}
            decimals={1}
            onChange={(spaceAfter) => onChange({ spaceAfter })}
          />
        </Field>
        <Field label="значение:" htmlFor="para-line-value">
          <NumberSpin
            id="para-line-value"
            value={fmt.lineValue}
            min={0}
            disabled={!LINE_VALUE_MODES.has(fmt.lineMode)}
            onChange={(lineValue) => onChange({ lineValue })}
            {...valueField}
          />
        </Field>
      </div>
      <label className="flex cursor-pointer items-center gap-2 pt-1 text-xs text-slate-600 dark:text-slate-300">
        <input
          type="checkbox"
          checked={fmt.contextualSpacing}
          onChange={(e) => onChange({ contextualSpacing: e.target.checked })}
          className="h-3.5 w-3.5 cursor-pointer accent-blue-600"
        />
        <span>Не добавлять интервал между абзацами одного стиля</span>
      </label>
    </Group>
  );
};

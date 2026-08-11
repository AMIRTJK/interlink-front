import {
  FIRST_LINE_OPTIONS,
  INDENT_STEP_CM,
  MAX_INDENT_CM,
  type IParagraphFormat,
  type TFirstLineMode,
} from "../model";
import { Field, Group, NumberSpin } from "./ParagraphControls";
import { SelectBox } from "./SelectBox";

interface IProps {
  fmt: IParagraphFormat;
  onChange: (patch: Partial<IParagraphFormat>) => void;
}

export const ParagraphIndentGroup = ({ fmt, onChange }: IProps) => (
  <Group title="Отступ">
    <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
      <Field label="Слева:" htmlFor="para-indent-left">
        <NumberSpin
          id="para-indent-left"
          value={fmt.indentLeft}
          unit="см"
          step={INDENT_STEP_CM}
          min={-MAX_INDENT_CM}
          max={MAX_INDENT_CM}
          decimals={2}
          onChange={(indentLeft) => onChange({ indentLeft })}
        />
      </Field>
      <Field label="первая строка:" htmlFor="para-first-line">
        <SelectBox<TFirstLineMode>
          id="para-first-line"
          value={fmt.firstLine}
          options={FIRST_LINE_OPTIONS}
          onChange={(firstLine) => onChange({ firstLine })}
        />
      </Field>
      <Field label="Справа:" htmlFor="para-indent-right">
        <NumberSpin
          id="para-indent-right"
          value={fmt.indentRight}
          unit="см"
          step={INDENT_STEP_CM}
          min={-MAX_INDENT_CM}
          max={MAX_INDENT_CM}
          decimals={2}
          onChange={(indentRight) => onChange({ indentRight })}
        />
      </Field>
      <Field label="на:" htmlFor="para-first-line-by">
        <NumberSpin
          id="para-first-line-by"
          value={fmt.firstLineBy}
          unit="см"
          step={INDENT_STEP_CM}
          min={0}
          max={MAX_INDENT_CM}
          decimals={2}
          disabled={fmt.firstLine === "none"}
          onChange={(firstLineBy) => onChange({ firstLineBy })}
        />
      </Field>
    </div>
  </Group>
);

import {
  ALIGN_OPTIONS,
  LEVEL_OPTIONS,
  type IParagraphFormat,
  type TParagraphAlign,
  type TParagraphLevel,
} from "../model";
import { Field, Group } from "./ParagraphControls";
import { SelectBox } from "./SelectBox";

interface IProps {
  fmt: IParagraphFormat;
  /** Уровень недоступен: в выделении есть пункты списка */
  levelDisabled: boolean;
  onChange: (patch: Partial<IParagraphFormat>) => void;
}

export const ParagraphGeneralGroup = ({
  fmt,
  levelDisabled,
  onChange,
}: IProps) => (
  <Group title="Общие">
    <Field label="Выравнивание:" htmlFor="para-align">
      <div className="max-w-[240px]">
        <SelectBox<TParagraphAlign>
          id="para-align"
          value={fmt.align}
          options={ALIGN_OPTIONS}
          onChange={(align) => onChange({ align })}
        />
      </div>
    </Field>
    <Field label="Уровень:" htmlFor="para-level">
      <div className="max-w-[240px]">
        <SelectBox<TParagraphLevel>
          id="para-level"
          value={fmt.level}
          options={LEVEL_OPTIONS}
          disabled={levelDisabled}
          onChange={(level) => onChange({ level })}
        />
      </div>
    </Field>
  </Group>
);

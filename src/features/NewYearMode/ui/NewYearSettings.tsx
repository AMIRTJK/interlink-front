import { Snowflake } from "lucide-react";
import { NEW_YEAR_EFFECTS } from "../model";
import { useNewYearMode } from "../lib/useNewYearMode";
import { NewYearSwitchRow } from "./NewYearSwitchRow";

/**
 * Общий выключатель новогоднего режима и набор его эффектов. Используется и в
 * меню шапки, и в поповере бокового/нижнего меню.
 */
export const NewYearSettings = () => {
  const { isEnabled, effects, toggleEnabled, toggleEffect } = useNewYearMode();

  return (
    <div className="space-y-1">
      <NewYearSwitchRow
        label="Новогодний режим"
        hint={isEnabled ? "Включён" : "Выключен"}
        icon={<Snowflake size={18} strokeWidth={2.2} />}
        isChecked={isEnabled}
        onToggle={toggleEnabled}
      />
      <div className="mx-3 my-1 h-px bg-zinc-100 dark:bg-zinc-700" />
      {NEW_YEAR_EFFECTS.map((effect) => (
        <NewYearSwitchRow
          key={effect.key}
          label={effect.label}
          hint={effect.hint}
          isChecked={effects[effect.key]}
          isMuted={!isEnabled}
          onToggle={() => toggleEffect(effect.key)}
        />
      ))}
    </div>
  );
};

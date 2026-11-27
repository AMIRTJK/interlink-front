import { Blend, Moon, Palette, Snowflake, Sun, SwatchBook } from "lucide-react";
import { useGlassEffect } from "@shared/lib";
import { NewYearSettings, useNewYearMode } from "@features/NewYearMode";
import { HeaderMenu } from "./HeaderMenu";
import { HeaderMenuItem } from "./HeaderMenuItem";
import { HeaderMenuPanel } from "./HeaderMenuPanel";
import { HeaderOptionGrid } from "./HeaderOptionGrid";
import { THEME_OPTIONS } from "./headerOptions";
import { HEADER_MENU_LABELS } from "./headerModel";
interface IProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  currentTheme?: string;
  setCurrentTheme?: (theme: string) => void;
}

const ICON_PROPS = { size: 18, strokeWidth: 2.2 } as const;
const THEME_PANEL = "theme";
const NEW_YEAR_PANEL = "newYear";

/** Меню «Внешний вид»: светлая/тёмная тема, цветовая тема, эффект стекла, новогодний режим. */
export const HeaderAppearanceMenu = ({
  isDarkMode,
  toggleTheme,
  currentTheme,
  setCurrentTheme,
}: IProps) => {
  const { isGlassEnabled, toggleGlass } = useGlassEffect();
  const { isEnabled: isNewYearEnabled } = useNewYearMode();
  return (
    <HeaderMenu
      label={HEADER_MENU_LABELS.appearance}
      icon={<SwatchBook {...ICON_PROPS} />}
    >
      {({ panel, openPanel, closePanel }) =>
        panel === NEW_YEAR_PANEL ? (
          <HeaderMenuPanel title="Новогодний режим" onBack={closePanel}>
            <NewYearSettings />
          </HeaderMenuPanel>
        ) : panel === THEME_PANEL ? (
          <HeaderMenuPanel title="Выбор темы" onBack={closePanel}>
            <HeaderOptionGrid
              options={THEME_OPTIONS}
              value={currentTheme}
              onSelect={(key) => setCurrentTheme?.(key)}
            />
          </HeaderMenuPanel>
        ) : (
          <>
            <HeaderMenuItem
              icon={isDarkMode ? <Sun {...ICON_PROPS} /> : <Moon {...ICON_PROPS} />}
              label={isDarkMode ? "Светлая тема" : "Темная тема"}
              onClick={toggleTheme}
            />
            <HeaderMenuItem
              icon={<Palette {...ICON_PROPS} />}
              label="Выбор темы"
              hint={currentTheme}
              onClick={() => openPanel(THEME_PANEL)}
            />
            <HeaderMenuItem
              icon={<Blend {...ICON_PROPS} />}
              label="Эффект стекла"
              hint={isGlassEnabled ? "Вкл" : "Выкл"}
              isActive={isGlassEnabled}
              onClick={toggleGlass}
            />
            <HeaderMenuItem
              icon={<Snowflake {...ICON_PROPS} />}
              label="Новогодний режим"
              hint={isNewYearEnabled ? "Вкл" : "Выкл"}
              isActive={isNewYearEnabled}
              onClick={() => openPanel(NEW_YEAR_PANEL)}
            />
          </>
        )
      }
    </HeaderMenu>
  );
};

import type { ReactNode } from "react";
import {
  Sun,
  Moon,
  Palette,
  Layers,
  PanelTop,
  PanelLeft,
  PanelBottom,
  PanelRight,
  Maximize,
  Minimize,
  Snowflake,
} from "lucide-react";
import { Tooltip } from "@shared/ui";
import { cn, useFullscreen } from "@shared/lib";
import { NewYearSettings, useNewYearMode } from "@features/NewYearMode";
import type { LayoutMode } from "../designSettings";
import { HeaderGlassButton } from "./HeaderGlassButton";
import { HeaderThemePopover } from "./HeaderThemePopover";
import { HeaderBgPopover } from "./HeaderBgPopover";
import { HeaderLayoutPopover } from "./HeaderLayoutPopover";
import { HeaderPopoverButton } from "./HeaderPopoverButton";
import { HEADER_ICON_BUTTON_CLASS, type TPopupPlacement } from "./headerModel";

export interface IHeaderDesignProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  currentTheme?: string;
  setCurrentTheme?: (theme: string) => void;
  currentBg?: string;
  setCurrentBg?: (bg: string) => void;
  layoutMode: LayoutMode;
  setLayoutMode?: (layout: LayoutMode) => void;
  hasGlass?: boolean;
}

interface IProps extends IHeaderDesignProps {
  tooltipPlacement: TPopupPlacement;
  popoverPlacement: TPopupPlacement;
}

const ICON_PROPS = { size: 18, strokeWidth: 2.2 } as const;

const LAYOUT_ICONS: Record<LayoutMode, ReactNode> = {
  top: <PanelTop {...ICON_PROPS} />,
  left: <PanelLeft {...ICON_PROPS} />,
  bottom: <PanelBottom {...ICON_PROPS} />,
  right: <PanelRight {...ICON_PROPS} />,
};

/**
 * Кнопки группы «Оформление» в исходном порядке: полноэкранный режим, светлая/тёмная
 * тема, стекло, новогодний режим, цветовая тема, фон, макет. Один набор используется и в «пилюле»,
 * и в компактном поповере, поэтому состояние полноэкранного режима живёт здесь.
 */
export const HeaderDesignButtons = ({
  isDarkMode,
  toggleTheme,
  currentTheme,
  setCurrentTheme,
  currentBg,
  setCurrentBg,
  layoutMode,
  setLayoutMode,
  hasGlass = false,
  tooltipPlacement,
  popoverPlacement,
}: IProps) => {
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const { isEnabled: isNewYearEnabled } = useNewYearMode();

  const fullscreenLabel = isFullscreen
    ? "Выйти из полноэкранного режима"
    : "Полноэкранный режим";

  return (
    <>
      <Tooltip title={fullscreenLabel} placement={tooltipPlacement}>
        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label={fullscreenLabel}
          aria-pressed={isFullscreen}
          className={HEADER_ICON_BUTTON_CLASS}
        >
          {isFullscreen ? <Minimize {...ICON_PROPS} /> : <Maximize {...ICON_PROPS} />}
        </button>
      </Tooltip>

      <Tooltip
        title={isDarkMode ? "Светлая тема" : "Темная тема"}
        placement={tooltipPlacement}
      >
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Смена темы"
          className={HEADER_ICON_BUTTON_CLASS}
        >
          {isDarkMode ? <Sun {...ICON_PROPS} /> : <Moon {...ICON_PROPS} />}
        </button>
      </Tooltip>

      {hasGlass && <HeaderGlassButton tooltipPlacement={tooltipPlacement} />}

      <HeaderPopoverButton
        label="Новогодний режим"
        icon={
          <Snowflake
            {...ICON_PROPS}
            className={cn(isNewYearEnabled && "text-sky-500 dark:text-sky-400")}
          />
        }
        tooltipPlacement={tooltipPlacement}
        popoverPlacement={popoverPlacement}
        content={
          <div className="w-[264px] p-2 bg-white dark:bg-th-raised rounded-[1.75rem]">
            <NewYearSettings />
          </div>
        }
      />

      <HeaderPopoverButton
        label="Выбор темы"
        tooltip="Выберите тему"
        icon={<Palette {...ICON_PROPS} />}
        tooltipPlacement={tooltipPlacement}
        popoverPlacement={popoverPlacement}
        content={
          <HeaderThemePopover
            currentTheme={currentTheme}
            setCurrentTheme={setCurrentTheme}
          />
        }
      />

      <HeaderPopoverButton
        label="Фон страницы"
        icon={<Layers {...ICON_PROPS} />}
        tooltipPlacement={tooltipPlacement}
        popoverPlacement={popoverPlacement}
        content={
          <HeaderBgPopover
            currentBg={currentBg}
            setCurrentBg={setCurrentBg}
            isDarkMode={isDarkMode}
          />
        }
      />

      <HeaderPopoverButton
        label="Макет страницы"
        icon={LAYOUT_ICONS[layoutMode]}
        tooltipPlacement={tooltipPlacement}
        popoverPlacement={popoverPlacement}
        content={
          <HeaderLayoutPopover
            layoutMode={layoutMode}
            setLayoutMode={setLayoutMode}
          />
        }
      />
    </>
  );
};

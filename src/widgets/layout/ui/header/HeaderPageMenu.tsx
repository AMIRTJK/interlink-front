import type { ReactNode } from "react";
import {
  Layers,
  LayoutTemplate,
  Maximize,
  Minimize,
  PanelBottom,
  PanelLeft,
  PanelRight,
  PanelTop,
} from "lucide-react";
import { useFullscreen } from "@shared/lib";
import { BACKGROUNDS, type LayoutMode } from "../designSettings";
import { HeaderMenu } from "./HeaderMenu";
import { HeaderMenuItem } from "./HeaderMenuItem";
import { HeaderMenuPanel } from "./HeaderMenuPanel";
import { HeaderOptionGrid } from "./HeaderOptionGrid";
import {
  BG_OPTIONS_DARK,
  BG_OPTIONS_LIGHT,
  LAYOUT_OPTIONS,
  isLayoutMode,
} from "./headerOptions";
import { HEADER_MENU_LABELS } from "./headerModel";

interface IProps {
  isDarkMode: boolean;
  currentBg?: string;
  setCurrentBg?: (bg: string) => void;
  layoutMode: LayoutMode;
  setLayoutMode?: (layout: LayoutMode) => void;
}

const ICON_PROPS = { size: 18, strokeWidth: 2.2 } as const;
const BG_PANEL = "background";
const LAYOUT_PANEL = "layout";

const LAYOUT_ICONS: Record<LayoutMode, ReactNode> = {
  top: <PanelTop {...ICON_PROPS} />,
  left: <PanelLeft {...ICON_PROPS} />,
  bottom: <PanelBottom {...ICON_PROPS} />,
  right: <PanelRight {...ICON_PROPS} />,
};

/** Меню «Страница»: фон, макет и полноэкранный режим. */
export const HeaderPageMenu = ({
  isDarkMode,
  currentBg,
  setCurrentBg,
  layoutMode,
  setLayoutMode,
}: IProps) => {
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  return (
    <HeaderMenu
      label={HEADER_MENU_LABELS.page}
      icon={<LayoutTemplate {...ICON_PROPS} />}
    >
      {({ panel, openPanel, closePanel }) => {
        if (panel === BG_PANEL) {
          return (
            <HeaderMenuPanel title="Фон страницы" onBack={closePanel}>
              <HeaderOptionGrid
                options={isDarkMode ? BG_OPTIONS_DARK : BG_OPTIONS_LIGHT}
                value={currentBg}
                onSelect={(key) => setCurrentBg?.(key)}
                columns={3}
              />
            </HeaderMenuPanel>
          );
        }

        if (panel === LAYOUT_PANEL) {
          return (
            <HeaderMenuPanel title="Макет страницы" onBack={closePanel}>
              <HeaderOptionGrid
                options={LAYOUT_OPTIONS}
                value={layoutMode}
                onSelect={(key) => {
                  if (isLayoutMode(key)) setLayoutMode?.(key);
                }}
              />
            </HeaderMenuPanel>
          );
        }

        return (
          <>
            <HeaderMenuItem
              icon={<Layers {...ICON_PROPS} />}
              label="Фон страницы"
              hint={currentBg ? BACKGROUNDS[currentBg]?.name : undefined}
              onClick={() => openPanel(BG_PANEL)}
            />
            <HeaderMenuItem
              icon={LAYOUT_ICONS[layoutMode]}
              label="Макет страницы"
              onClick={() => openPanel(LAYOUT_PANEL)}
            />
            <HeaderMenuItem
              icon={isFullscreen ? <Minimize {...ICON_PROPS} /> : <Maximize {...ICON_PROPS} />}
              label={isFullscreen ? "Выйти из полноэкранного" : "Полноэкранный режим"}
              isActive={isFullscreen}
              onClick={toggleFullscreen}
            />
          </>
        );
      }}
    </HeaderMenu>
  );
};

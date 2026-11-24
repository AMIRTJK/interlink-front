import { useCallback, useMemo, useState, type ReactNode } from "react";
import { Popover } from "antd";
import { Tooltip } from "@shared/ui";
import { HEADER_ICON_BUTTON_CLASS, HEADER_POPOVER_INNER_STYLE } from "./headerModel";

export interface IHeaderMenuApi {
  /** Открытая вложенная панель (выбор темы, фона…) или null — корневой список. */
  panel: string | null;
  openPanel: (panel: string) => void;
  closePanel: () => void;
  /** Закрывает меню целиком — для действий, которые уводят с экрана. */
  close: () => void;
}

interface IProps {
  label: string;
  icon: ReactNode;
  children: (api: IHeaderMenuApi) => ReactNode;
}

/**
 * Группа кнопок шапки, свёрнутая в одну иконку: по клику раскрывает список
 * действий группы, закрывается кликом мимо или повторным кликом по иконке.
 * Наведение не используем — меню схлопывалось, стоило курсору соскользнуть.
 * Вложенные списки открываются в этом же окне, а не отдельным поповером: так
 * окно одно, закрывается целиком и не уезжает за край экрана.
 */
export const HeaderMenu = ({ label, icon, children }: IProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [panel, setPanel] = useState<string | null>(null);

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
    if (!open) setPanel(null);
  }, []);

  const api = useMemo<IHeaderMenuApi>(
    () => ({
      panel,
      openPanel: setPanel,
      closePanel: () => setPanel(null),
      close: () => handleOpenChange(false),
    }),
    [panel, handleOpenChange],
  );

  return (
    <Popover
      open={isOpen}
      onOpenChange={handleOpenChange}
      trigger="click"
      placement="bottomRight"
      arrow={false}
      overlayInnerStyle={HEADER_POPOVER_INNER_STYLE}
      content={
        <div
          role="menu"
          aria-label={label}
          className="w-[264px] max-h-[min(460px,75vh)] overflow-y-auto p-2 bg-white dark:bg-zinc-800 rounded-[1.75rem] shadow-xl"
        >
          {panel === null && (
            <p className="px-3 pt-2 pb-1.5 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              {label}
            </p>
          )}
          {children(api)}
        </div>
      }
    >
      <Tooltip title={label} placement="bottom" open={isOpen ? false : undefined}>
        <button
          type="button"
          aria-label={label}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          className={HEADER_ICON_BUTTON_CLASS}
        >
          {icon}
        </button>
      </Tooltip>
    </Popover>
  );
};

import { SlidersHorizontal } from "lucide-react";
import { HeaderButtonGroup } from "./HeaderButtonGroup";
import { HeaderPopoverButton } from "./HeaderPopoverButton";
import { HeaderDesignButtons, type IHeaderDesignProps } from "./HeaderDesignButtons";
import type { TPopupPlacement } from "./headerModel";

type TDesignGroupVariant = "responsive" | "compact";

interface IProps extends IHeaderDesignProps {
  label: string;
  variant?: TDesignGroupVariant;
  tooltipPlacement: TPopupPlacement;
  popoverPlacement: TPopupPlacement;
}

/**
 * Группа «Оформление». На широких экранах — «пилюля» со всеми кнопками,
 * на узких (и в узком боковом меню) — одна кнопка, раскрывающая тот же набор
 * в поповере: так шапка не переполняется, а действия остаются в одном месте.
 */
export const HeaderDesignGroup = ({
  label,
  variant = "responsive",
  tooltipPlacement,
  popoverPlacement,
  ...designProps
}: IProps) => {
  const isResponsive = variant === "responsive";

  const compactContent = (
    <div className="max-w-[300px] p-4 bg-white dark:bg-th-raised rounded-[2.5rem]">
      <p className="text-xs font-bold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider mb-3 px-1">
        {label}
      </p>
      <HeaderButtonGroup label={label} className="flex-wrap justify-center">
        <HeaderDesignButtons
          {...designProps}
          tooltipPlacement="bottom"
          popoverPlacement={popoverPlacement}
        />
      </HeaderButtonGroup>
    </div>
  );

  return (
    <>
      {isResponsive && (
        <HeaderButtonGroup label={label} className="max-xl:hidden">
          <HeaderDesignButtons
            {...designProps}
            tooltipPlacement={tooltipPlacement}
            popoverPlacement={popoverPlacement}
          />
        </HeaderButtonGroup>
      )}

      <HeaderButtonGroup
        label={label}
        className={isResponsive ? "xl:hidden" : undefined}
      >
        <HeaderPopoverButton
          label={label}
          icon={<SlidersHorizontal size={18} strokeWidth={2.2} />}
          tooltipPlacement={tooltipPlacement}
          popoverPlacement={popoverPlacement}
          content={compactContent}
        />
      </HeaderButtonGroup>
    </>
  );
};

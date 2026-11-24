import type { ReactNode } from "react";
import { Popover } from "antd";
import { Tooltip } from "@shared/ui";
import {
  HEADER_ICON_BUTTON_CLASS,
  HEADER_POPOVER_INNER_STYLE,
  type TPopupPlacement,
} from "./headerModel";

interface IProps {
  label: string;
  tooltip?: string;
  icon: ReactNode;
  content: ReactNode;
  tooltipPlacement: TPopupPlacement;
  popoverPlacement: TPopupPlacement;
}

export const HeaderPopoverButton = ({
  label,
  tooltip,
  icon,
  content,
  tooltipPlacement,
  popoverPlacement,
}: IProps) => (
  <Popover
    content={content}
    trigger="click"
    placement={popoverPlacement}
    arrow={false}
    overlayInnerStyle={HEADER_POPOVER_INNER_STYLE}
  >
    <Tooltip title={tooltip ?? label} placement={tooltipPlacement}>
      <button type="button" aria-label={label} className={HEADER_ICON_BUTTON_CLASS}>
        {icon}
      </button>
    </Tooltip>
  </Popover>
);

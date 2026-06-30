import React from "react";
import { Tooltip as AntdTooltip } from "antd";
import type { TooltipProps } from "antd";

export const Tooltip: React.FC<TooltipProps> = (props) => {
  return <AntdTooltip {...props} />;
};

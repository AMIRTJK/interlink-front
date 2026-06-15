import React from "react";
import { tajikFlagInnerSvg } from "../lib/utils";

// Государственный флаг Республики Таджикистан для шапки штампа ЭЦП.
// Геометрия берётся из общего помощника tajikFlagInnerSvg(), чтобы экранный
// штамп и его печатная (вшитая картинкой) версия выглядели идентично.
export const TajikFlag = ({
  width = 40,
  height = 28,
}: {
  width?: number;
  height?: number;
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 42 30"
    role="img"
    aria-label="Флаг Республики Таджикистан"
    style={{ display: "block", flexShrink: 0 }}
    dangerouslySetInnerHTML={{ __html: tajikFlagInnerSvg() }}
  />
);

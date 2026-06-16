import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { buildDSStampSvg } from "../lib/utils";

// Штамп ЭЦП рисуется единым SVG (buildDSStampSvg) во вьюбоксе 320×110 — тем же,
// что вшивается картинкой в тело письма при подписании. Обёртка задаёт ширину
// 100% и пропорцию 320:110, поэтому рисунок выглядит одинаково (одной высоты)
// во всех местах: плейсхолдер до подписи, блоки «Подписывающий»/«Согласующие»,
// приложение №1 и предпросмотр совпадают с тем, что видно после подписи.
export const DSStamp = ({
  name,
  certSerial,
  signedAt,
  validUntil,
}: {
  name: string;
  certSerial: string;
  signedAt: string;
  validUntil: string;
}) => {
  const svg = useMemo(
    () => buildDSStampSvg({ name, certSerial, signedAt, validUntil }),
    [name, certSerial, signedAt, validUntil],
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.93, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      style={{ width: "100%", aspectRatio: "320 / 110" }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

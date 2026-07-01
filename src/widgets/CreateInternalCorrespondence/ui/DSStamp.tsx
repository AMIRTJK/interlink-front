import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  buildDSStampSvg,
  DS_STAMP_VIEW_H,
  DS_STAMP_VIEW_W,
  type DSStampLang,
} from "../lib/utils";

interface IProps {
  name: string;
  certSerial: string;
  signedAt: string;
  validUntil: string;
  /** Язык подписи. По умолчанию TJ — как в утверждённом макете. */
  defaultLang?: DSStampLang;
  /**
   * Показывать ли кликабельный переключатель языка поверх «пилюль» EN/RU/TJ.
   * В документе/печати штамп всегда статичный (картинка), поэтому там это не нужно.
   */
  interactiveLang?: boolean;
}

// Геометрия «пилюль» языка в координатах viewBox — нужна, чтобы наложить
// невидимые кликабельные кнопки строго поверх нарисованных в SVG пилюль.
// Проценты считаются от viewBox, поэтому накладка совпадает при любом масштабе.
const PILLS_LEFT = 626;
const PILLS_TOP = 26;
const PILLS_WIDTH = 110;
const PILLS_HEIGHT = 19;

const LANGS: DSStampLang[] = ["EN", "RU", "TJ"];

/**
 * Штамп ЭЦП. Рисуется ровно тем же SVG (`buildDSStampSvg`), что вшивается в тело
 * документа при подписании, — поэтому предпросмотр, плейсхолдер, блоки
 * «Подписывающий»/«Согласующие», приложение №1, сам документ и печать выглядят
 * абсолютно одинаково. Обёртка задаёт пропорции макета (760×333); SVG тянется на
 * всю ширину контейнера, сохраняя их при любом масштабе.
 */
export const DSStamp = ({
  name,
  certSerial,
  signedAt,
  validUntil,
  defaultLang = "TJ",
  interactiveLang = true,
}: IProps) => {
  const [lang, setLang] = useState<DSStampLang>(defaultLang);

  const svg = useMemo(
    () => buildDSStampSvg({ name, certSerial, signedAt, validUntil }, lang),
    [name, certSerial, signedAt, validUntil, lang],
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.93, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="relative w-full max-w-[760px]"
      style={{ aspectRatio: `${DS_STAMP_VIEW_W} / ${DS_STAMP_VIEW_H}` }}
    >
      <div
        className="absolute inset-0"
        dangerouslySetInnerHTML={{ __html: svg }}
      />

      {interactiveLang && (
        <div
          className="absolute flex"
          style={{
            left: `${(PILLS_LEFT / DS_STAMP_VIEW_W) * 100}%`,
            top: `${(PILLS_TOP / DS_STAMP_VIEW_H) * 100}%`,
            width: `${(PILLS_WIDTH / DS_STAMP_VIEW_W) * 100}%`,
            height: `${(PILLS_HEIGHT / DS_STAMP_VIEW_H) * 100}%`,
          }}
        >
          {LANGS.map((l) => (
            <button
              key={l}
              type="button"
              aria-label={`Switch language to ${l}`}
              // stopPropagation — чтобы клик по пилюле не запускал drag штампа
              // в редакторе и не закрывал предпросмотр.
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                setLang(l);
              }}
              className="flex-1 cursor-pointer bg-transparent"
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

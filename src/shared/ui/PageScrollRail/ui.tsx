import { usePageScrollRail } from "./lib/usePageScrollRail";
import "./style.css";

/**
 * Полоса прокрутки страницы поверх контента. Нативная полоса у корня скрыта
 * (global.css): она отнимает ширину, и страницы со скроллом и без него
 * сдвигались при переключении. Рельс скрыт от скринридеров — прокрутка
 * с клавиатуры и колесом остаётся нативной.
 */
export const PageScrollRail = () => {
  const { railRef, thumbRef, streakRef, readoutRef } = usePageScrollRail();

  return (
    <div
      ref={railRef}
      className="ui-scroll-rail"
      data-scrollable="false"
      data-active="false"
      data-dir="down"
      aria-hidden="true"
    >
      <div className="ui-scroll-rail__track" />
      <div className="ui-scroll-rail__ticks" />
      <div ref={thumbRef} className="ui-scroll-rail__thumb">
        <div ref={streakRef} className="ui-scroll-rail__streak" />
        <div className="ui-scroll-rail__core" />
        <span ref={readoutRef} className="ui-scroll-rail__readout">
          0%
        </span>
      </div>
    </div>
  );
};

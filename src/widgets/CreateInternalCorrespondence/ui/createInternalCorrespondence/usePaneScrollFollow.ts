import { useEffect, type RefObject } from "react";

import type {
  IScrollFollowLayout,
  IScrollFollowRefs,
} from "./scrollFollowModel";

interface IPanelsGroupParams extends IScrollFollowRefs, IScrollFollowLayout {
  id?: string | number;
  panelsGroupRef: RefObject<HTMLDivElement | null>;
}

export const usePanelsGroupScrollFollow = ({
  id,
  panelsGroupRef,
  rootScrollRef,
  pageCanvasRef,
  stickyHeaderRef,
  pageCount,
  orientation,
  formExpanded,
  panelsInToolbar,
}: IPanelsGroupParams) => {
  // Боковые панели (вкладки + раскрытая панель) спозиционированы абсолютно
  // внутри высокого холста (pageCanvasRef, высотой во все страницы), поэтому
  // при прокрутке вниз уходили за верх экрана — чтобы выбрать версию/участника,
  // приходилось скроллить в самое начало. Держим группу в поле зрения: смещаем
  // её по вертикали за прокруткой через transform (position:sticky здесь не
  // работает — его перехватывает серая область с overflow), а высоту раскрытой
  // панели ограничиваем видимой областью (переменная --icc-panel-max-h), чтобы
  // её внутренний список прокручивался на месте. Тот же приём, что для левого
  // A4-холста входящего письма выше.
  useEffect(() => {
    if (!id) return;
    const scroller = rootScrollRef.current;
    const canvas = pageCanvasRef.current;
    const group = panelsGroupRef.current;
    if (!scroller || !canvas || !group) return;

    const BOT_M = 24; // нижний отступ для раскрытой панели
    const MIN_VISIBLE = 160; // минимум пикселей группы, что держим над холстом

    const update = () => {
      // Прижимаем группу не к самому верху, а ПОД липкую шапку редактора
      // (тулбар + панель разделов), иначе её содержимое пряталось бы под ней.
      const headerH = stickyHeaderRef.current?.offsetHeight ?? 0;
      const TOP_M = headerH + 12;
      const canvasTop =
        canvas.getBoundingClientRect().top -
        scroller.getBoundingClientRect().top;
      let shift = Math.max(0, TOP_M - canvasTop);
      shift = Math.min(shift, Math.max(0, canvas.offsetHeight - MIN_VISIBLE));
      // Верх группы в координатах видимой области: от него отсчитываем
      // доступную высоту, чтобы низ раскрытой панели не уезжал под экран.
      const groupViewportTop = canvasTop + shift;
      const availH = Math.max(
        200,
        scroller.clientHeight - groupViewportTop - BOT_M,
      );
      group.style.setProperty("--icc-panel-max-h", `${availH}px`);
      group.style.transform = shift > 0 ? `translateY(${shift}px)` : "";
    };

    update();
    scroller.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    // Высота липкой шапки меняется (перенос кнопок на новую строку, включение
    // панели разделов, пагинация входящего) — пересчитываем позицию панелей.
    const headerRO = new ResizeObserver(update);
    if (stickyHeaderRef.current) headerRO.observe(stickyHeaderRef.current);
    return () => {
      scroller.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      headerRO.disconnect();
      group.style.transform = "";
    };
  }, [id, pageCount, orientation, formExpanded, panelsInToolbar]);
};

interface INavPaneParams extends IScrollFollowRefs, IScrollFollowLayout {
  navPaneEnabled: boolean;
  navPaneWrapRef: RefObject<HTMLDivElement | null>;
}

export const useNavPaneScrollFollow = ({
  navPaneEnabled,
  navPaneWrapRef,
  rootScrollRef,
  pageCanvasRef,
  stickyHeaderRef,
  pageCount,
  orientation,
  formExpanded,
  panelsInToolbar,
}: INavPaneParams) => {
  // Область навигации должна оставаться на виду при прокрутке документа, как
  // пришвартованная панель Word. Тот же приём, что для левого A4-холста и
  // группы боковых панелей выше: CSS sticky здесь перехватывает серая область
  // с overflow, поэтому смещаем обёртку сами и заодно отдаём панели доступную
  // высоту (--icc-nav-max-h), чтобы её списки прокручивались внутри.
  useEffect(() => {
    if (!navPaneEnabled) return;
    const scroller = rootScrollRef.current;
    const canvas = pageCanvasRef.current;
    const wrap = navPaneWrapRef.current;
    if (!scroller || !canvas || !wrap) return;

    const BOT_M = 24;
    const MIN_VISIBLE = 200;

    const update = () => {
      const TOP_M = (stickyHeaderRef.current?.offsetHeight ?? 0) + 12;
      const canvasTop =
        canvas.getBoundingClientRect().top -
        scroller.getBoundingClientRect().top;
      let shift = Math.max(0, TOP_M - canvasTop);
      shift = Math.min(shift, Math.max(0, canvas.offsetHeight - MIN_VISIBLE));
      const paneViewportTop = canvasTop + shift;
      const availH = Math.max(
        240,
        scroller.clientHeight - paneViewportTop - BOT_M,
      );
      // Отдаём панели всю доступную высоту — распределить её между шапкой,
      // поиском, вкладками и прокручиваемым списком она умеет сама (flex).
      wrap.style.setProperty("--icc-nav-max-h", `${availH}px`);
      wrap.style.transform = shift > 0 ? `translateY(${shift}px)` : "";
    };

    update();
    scroller.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const headerRO = new ResizeObserver(update);
    if (stickyHeaderRef.current) headerRO.observe(stickyHeaderRef.current);
    return () => {
      scroller.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      headerRO.disconnect();
      wrap.style.transform = "";
    };
  }, [navPaneEnabled, pageCount, orientation, formExpanded, panelsInToolbar]);
};

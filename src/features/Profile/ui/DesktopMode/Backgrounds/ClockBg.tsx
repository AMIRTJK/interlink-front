interface IProps {
  isDark: boolean;
}

/**
 * Только подложка сцены «Часы»: сами часы стоят в раскладке экрана рядом с
 * карточкой (layout "split" в SCENES), чтобы карточка их не перекрывала.
 */
export const ClockBg = ({ isDark }: IProps) => (
  <div
    className={`absolute inset-0 ${
      isDark
        ? "bg-[radial-gradient(ellipse_at_30%_45%,#232838_0%,#10131d_50%,#05060b_100%)]"
        : "bg-[radial-gradient(ellipse_at_30%_45%,#fdfaf3_0%,#efe8d9_55%,#ddd3bf_100%)]"
    }`}
  />
);

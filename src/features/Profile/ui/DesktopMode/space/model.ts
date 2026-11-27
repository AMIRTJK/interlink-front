import horizonSrc from "../assets/space-horizon.webp";
import globeSrc from "../assets/space-globe.webp";

export type TSpaceVariant = "horizon" | "globe";

export interface ISpaceVariantOption {
  key: TSpaceVariant;
  label: string;
  hint: string;
  src: string;
  /** Какую часть картинки сохранять, когда экран уже или шире самой картинки. */
  objectPosition: string;
}

export const SPACE_VARIANTS: ISpaceVariantOption[] = [
  {
    key: "horizon",
    label: "Горизонт",
    hint: "Край Земли с огнями городов и восходом",
    src: horizonSrc,
    objectPosition: "50% 100%",
  },
  {
    key: "globe",
    label: "Планета",
    hint: "Вся Земля целиком справа",
    src: globeSrc,
    // Земля стоит справа: на узком экране режем левый край, а не планету.
    objectPosition: "80% 50%",
  },
];

export const DEFAULT_SPACE_VARIANT: TSpaceVariant = "horizon";

export const STORAGE_SPACE_VARIANT_KEY = "desktop_mode_space_variant";

export const SPACE_SWITCHER_LABEL = "Вид космоса";

export const isSpaceVariant = (value: unknown): value is TSpaceVariant =>
  SPACE_VARIANTS.some((variant) => variant.key === value);

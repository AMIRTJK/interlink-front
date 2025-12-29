export type Theme = "light" | "dark" | "space";

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isAnimEnabled: boolean;
  setIsAnimEnabled: (enabled: boolean) => void;
  isSnowEnabled: boolean;
  setIsSnowEnabled: (enabled: boolean) => void;
}

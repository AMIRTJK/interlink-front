export type Theme = "light" | "dark" | "space";

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

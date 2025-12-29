import { AppRouter } from "./routes/AppRouter";
import { SnowOverlay } from "@shared/ui";
import { useTheme } from "@shared/lib";

export const App = () => {
  const { isSnowEnabled } = useTheme();
  return (
    <>
      <SnowOverlay enabled={isSnowEnabled} />
      <AppRouter />
    </>
  );
};

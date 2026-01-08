import { AppRouter } from "./routes/AppRouter";
import { SnowOverlay, RainOverlay, AutumnOverlay } from "@shared/ui";

import { useTheme } from "@shared/lib";

export const App = () => {
  const { isSnowEnabled, isRainEnabled, isAutumnEnabled } = useTheme();
  return (
    <>
      <SnowOverlay enabled={isSnowEnabled} />
      <RainOverlay enabled={isRainEnabled} />
      <AutumnOverlay enabled={isAutumnEnabled} />
      <AppRouter />
    </>
  );
};


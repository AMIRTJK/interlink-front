import { AppRouter } from "./routes/AppRouter";
import { SnowOverlay, RainOverlay, AutumnOverlay, SakuraOverlay } from "@shared/ui";

import { useTheme } from "@shared/lib";

export const App = () => {
  const { isSnowEnabled, isRainEnabled, isAutumnEnabled, isSakuraEnabled } = useTheme();
  return (
    <>
      <SnowOverlay enabled={isSnowEnabled} />
      <RainOverlay enabled={isRainEnabled} />
      <AutumnOverlay enabled={isAutumnEnabled} />
      <SakuraOverlay enabled={isSakuraEnabled} />
      <AppRouter />
    </>
  );
};


import { AppRouter } from "./routes/AppRouter";
import { PageScrollRail, ToastContainer } from "@shared/ui";
import { ChatProvider } from "@widgets/Chat";
import { RealtimeNotifications, ThemeTokens } from "./providers";

export const App = () => {
  return (
    <ChatProvider>
      <ThemeTokens />
      <RealtimeNotifications />
      <AppRouter />
      <ToastContainer />
      <PageScrollRail />
    </ChatProvider>
  );
};



import { AppRouter } from "./routes/AppRouter";
import { ToastContainer } from "@shared/ui";
import { ChatProvider } from "@widgets/Chat";
import { RealtimeNotifications } from "./providers";

export const App = () => {
  return (
    <ChatProvider>
      <RealtimeNotifications />
      <AppRouter />
      <ToastContainer />
    </ChatProvider>
  );
};



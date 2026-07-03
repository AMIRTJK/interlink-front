import { AppRouter } from "./routes/AppRouter";
import { ToastContainer } from "@shared/ui";
import { ChatProvider } from "@widgets/Chat";

export const App = () => {
  return (
    <ChatProvider>
      <AppRouter />
      <ToastContainer />
    </ChatProvider>
  );
};



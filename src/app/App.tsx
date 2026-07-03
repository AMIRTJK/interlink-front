import { AppRouter } from "./routes/AppRouter";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ChatProvider } from "@widgets/Chat";

export const App = () => {
  return (
    <ChatProvider>
      <AppRouter />
      <ToastContainer position="bottom-right" autoClose={3000} />
    </ChatProvider>
  );
};



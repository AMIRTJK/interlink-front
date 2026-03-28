import { AppRouter } from "./routes/AppRouter";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const App = () => {
  return (
    <>
      <AppRouter />
      <ToastContainer position="bottom-right" autoClose={3000} />
    </>
  );
};



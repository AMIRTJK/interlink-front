import { Outlet } from "react-router-dom";
import { Header } from "./Header";

export const Main = () => {
  return (
    <div className="page-container">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

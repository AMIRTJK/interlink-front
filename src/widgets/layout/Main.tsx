import { Outlet } from "react-router-dom";

export const Main = () => {
  return (
    <div className="page-container">
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

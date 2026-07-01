import { Outlet } from "react-router-dom";
import { Header } from "./Header";

export const ProfileLayout = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-slate-50 to-blue-50">
      {/* Декоративный фон нового дизайна. Слой fixed, чтобы не ломать sticky-хедер. */}
      <div
        aria-hidden="true"
        className="fixed inset-0 overflow-hidden pointer-events-none"
      >
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-emerald-700 via-green-600 to-teal-700 opacity-[0.08] blur-[100px] rounded-full" />
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-green-800 via-teal-700 to-emerald-600 opacity-[0.06] blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-gradient-to-tr from-lime-900 via-green-700 to-teal-600 opacity-[0.05] blur-[110px] rounded-full" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="p-6 pb-0">
          <Header />
        </div>
        <main className="pb-10">
          <div className="w-full px-6 pt-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

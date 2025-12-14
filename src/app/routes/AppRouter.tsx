import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppRoutes } from "@shared/config/AppRoutes";
import { ToastContainer } from "react-toastify";
import { Suspense, lazy } from "react";
import { Loader } from "@shared/ui/Loader";

const Auth = lazy(() => import("@pages/Auth/Auth").then(module => ({ default: module.Auth })));
const ProfilePage = lazy(() => import("@pages/profile/ProfilePage").then(module => ({ default: module.ProfilePage })));
const TasksPage = lazy(() => import("@pages/profile/TasksPage").then(module => ({ default: module.TasksPage })));
const CalendarPage = lazy(() => import("@pages/profile/CalendarPage").then(module => ({ default: module.CalendarPage })));
const AnalyticsPage = lazy(() => import("@pages/profile/AnalyticsPage").then(module => ({ default: module.AnalyticsPage })));

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path={`/${AppRoutes.LOGIN}`} element={<Auth />} />
          <Route path={`/${AppRoutes.PROFILE}`} element={<ProfilePage />}>
            <Route
              index
              element={<Navigate to={AppRoutes.PROFILE_TASKS} replace />}
            />
            <Route path={AppRoutes.PROFILE_TASKS} element={<TasksPage />} />
            <Route path={AppRoutes.PROFILE_CALENDAR} element={<CalendarPage />} />
            <Route
              path={AppRoutes.PROFILE_ANALYTICS}
              element={<AnalyticsPage />}
            />
          </Route>
          <Route
            path="*"
            element={<Navigate to={`/${AppRoutes.PROFILE}`} replace />}
          />
        </Routes>
      </Suspense>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </BrowserRouter>
  );
};

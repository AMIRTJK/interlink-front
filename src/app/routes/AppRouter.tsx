import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Auth } from "@features/auth/Auth";
import { AppRoutes } from "@shared/config/AppRoutes";
import { ProfilePage } from "@pages/profile/ProfilePage";
import { TasksPage } from "@pages/profile/TasksPage";
import { CalendarPage } from "@pages/profile/CalendarPage";
import { AnalyticsPage } from "@pages/profile/AnalyticsPage";
import { Header } from "@widgets/layout/Header";

export const AppRouter = () => {
  return (
    <BrowserRouter>
  <Header />
  <Routes>
    <Route path={`/${AppRoutes.LOGIN}`} element={<Auth />} />
    <Route path={`/${AppRoutes.PROFILE}`} element={<ProfilePage />}>
      <Route index element={<Navigate to={AppRoutes.PROFILE_TASKS} replace />} />
      <Route path={AppRoutes.PROFILE_TASKS} element={<TasksPage />} />
      <Route path={AppRoutes.PROFILE_CALENDAR} element={<CalendarPage />} />
      <Route path={AppRoutes.PROFILE_ANALYTICS} element={<AnalyticsPage />} />
    </Route>
    <Route path="*" element={<Navigate to={`/${AppRoutes.PROFILE}`} replace />} />
  </Routes>
</BrowserRouter>

  );
};

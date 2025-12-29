import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppRoutes } from "@shared/config/AppRoutes";
import { ToastContainer } from "react-toastify";
import { Suspense, lazy } from "react";
import { Loader } from "@shared/ui/Loader";
import { MainLayout, ProfileLayout } from "@widgets/layout";
import { RegistryTable } from "@widgets/RegistryTable";

const Auth = lazy(() =>
  import("@pages/Auth/Auth").then((module) => ({ default: module.Auth }))
);
const ProfilePage = lazy(() =>
  import("@pages/modules/profile/ProfilePage").then((module) => ({
    default: module.ProfilePage,
  }))
);
const TasksPage = lazy(() =>
  import("@pages/modules/profile/TasksPage").then((module) => ({
    default: module.TasksPage,
  }))
);
const CalendarPage = lazy(() =>
  import("@pages/modules/profile/CalendarPage").then((module) => ({
    default: module.CalendarPage,
  }))
);
const AnalyticsPage = lazy(() =>
  import("@pages/modules/profile/AnalyticsPage").then((module) => ({
    default: module.AnalyticsPage,
  }))
);

const CorrespondencePage = lazy(() =>
  import("@pages/modules/correspondence/CorrespondencePage").then((module) => ({
    default: module.CorrespondencePage,
  }))
);

const PlaceholderPage = lazy(() =>
  import("@pages/modules/placeholderpage/PlaceholderPage").then((module) => ({
    default: module.PlaceholderPage,
  }))
);

const mockData: unknown = [
  {
    id: "1",
    number: "ИСХ-101",
    title: "Договор на поставку оборудования",
    date: "25.12.2025",
    status: "completed",
    sender: 'ООО "Вектор"',
  },
  {
    id: "2",
    number: "ВХ-202",
    title: "Запрос коммерческого предложения",
    date: "26.12.2025",
    status: "pending",
    sender: "ИП Иванов",
  },
];

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path={`/${AppRoutes.LOGIN}`} element={<Auth />} />

          <Route element={<ProfileLayout />}>
            <Route path={`/${AppRoutes.PROFILE}`} element={<ProfilePage />}>
              <Route
                index
                element={
                  <Navigate
                    to={`/${AppRoutes.PROFILE}/${AppRoutes.PROFILE_TASKS}`}
                    replace
                  />
                }
              />
              <Route path={AppRoutes.PROFILE_TASKS} element={<TasksPage />} />
              <Route
                path={AppRoutes.PROFILE_CALENDAR}
                element={<CalendarPage />}
              />
              <Route
                path={AppRoutes.PROFILE_ANALYTICS}
                element={<AnalyticsPage />}
              />
            </Route>
          </Route>

          <Route path={`/${AppRoutes.MODULES}`} element={<MainLayout />}>
            <Route
              path={AppRoutes.CORRESPONDENCE}
              element={<CorrespondencePage />}
            >
              <Route
                index
                element={
                  <Navigate
                    to={`${AppRoutes.CORRESPONDENCE_INCOMING}`}
                    replace
                  />
                }
              />
              <Route
                path={AppRoutes.CORRESPONDENCE_INCOMING}
                element={<RegistryTable type="incoming" data={mockData} />}
              />
              <Route
                path={AppRoutes.CORRESPONDENCE_OUTGOING}
                element={<RegistryTable type="outgoing" data={mockData} />}
              />
            </Route>
            <Route path="*" element={<PlaceholderPage />} />
          </Route>

          <Route
            path="*"
            element={
              <Navigate
                to={`/${AppRoutes.PROFILE}/${AppRoutes.PROFILE_TASKS}`}
                replace
              />
            }
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

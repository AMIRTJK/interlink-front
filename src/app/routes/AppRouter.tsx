import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppRoutes } from "@shared/config/AppRoutes";
import { tokenControl } from "@shared/lib";
import { ToastContainer } from "react-toastify";
import { Suspense, lazy,  } from "react";
import { Loader } from "@shared/ui/Loader";
import { MainLayout, ProfileLayout } from "@widgets/layout";
import { RegistryTable } from "@widgets/RegistryTable";
import PrivateRoute from "./PrivateRoute";

// Lazy-loaded страницы
const Auth = lazy(() =>
  import("@pages/Auth/Auth").then((m) => ({ default: m.Auth }))
);
const ProfilePage = lazy(() =>
  import("@pages/modules/profile/ProfilePage").then((m) => ({
    default: m.ProfilePage,
  }))
);
const TasksPage = lazy(() =>
  import("@pages/modules/profile/TasksPage").then((m) => ({
    default: m.TasksPage,
  }))
);
const CalendarPage = lazy(() =>
  import("@pages/modules/profile/CalendarPage").then((m) => ({
    default: m.CalendarPage,
  }))
);
const AnalyticsPage = lazy(() =>
  import("@pages/modules/profile/AnalyticsPage").then((m) => ({
    default: m.AnalyticsPage,
  }))
);
const CorrespondencePage = lazy(() =>
  import("@pages/modules/correspondence/CorrespondencePage").then((m) => ({
    default: m.CorrespondencePage,
  }))
);
const CreateCorrespondencePage = lazy(() =>
  import("@pages/modules/correspondence/CreateCorrespondencePage").then(
    (m) => ({ default: m.CreateCorrespondencePage })
  )
);
const PlaceholderPage = lazy(() =>
  import("@pages/modules/placeholderpage/PlaceholderPage").then((m) => ({
    default: m.PlaceholderPage,
  }))
);
const NotFoundPage = lazy(() =>
  import("@shared/ui/NotFoundPage/NotFoundPage").then((m) => ({
    default: m.NotFoundPage,
  }))
);

// Mock data для таблиц
const mockData: Record<string, unknown>[] = [
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
          {/* Редирект с корня */}
          <Route
            path="/"
            element={
              tokenControl.get() ? (
                <Navigate to={AppRoutes.PROFILE_TASKS} replace />
              ) : (
                <Navigate to={AppRoutes.LOGIN} replace />
              )
            }
          />

          {/* Публичный маршрут */}
          <Route path="/auth/login" element={<Auth />} />

          {/* Приватные маршруты */}
          <Route element={<PrivateRoute />}>
            {/* Профиль */}
            <Route element={<ProfileLayout />}>
              <Route path="/profile" element={<ProfilePage />}>
                <Route
                  index
                  element={<Navigate to={AppRoutes.PROFILE_TASKS} replace />}
                />
                <Route path="tasks" element={<TasksPage />} />
                <Route path="calendar" element={<CalendarPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
              </Route>
            </Route>

            {/* Модули */}
            <Route path="/modules" element={<MainLayout />}>
              <Route path="correspondence" element={<CorrespondencePage />}>
                <Route index element={<Navigate to="incoming" replace />} />
                <Route path="incoming">
                  <Route
                    index
                    element={
                      <RegistryTable
                        type="incoming"
                        createButtonText="Добавить письмо"
                        data={mockData}
                      />
                    }
                  />
                  <Route
                    path="create"
                    element={<CreateCorrespondencePage type="incoming" />}
                  />
                </Route>
                <Route path="outgoing">
                  <Route
                    index
                    element={
                          <RegistryTable
                          type="outgoing"
                          createButtonText="Добавить письмо"
                          data={mockData}
                        />
                    }
                  />
                  <Route
                    path="create"
                    element={<CreateCorrespondencePage type="outgoing" />}
                  />
                </Route>
              </Route>
              <Route path="*" element={<PlaceholderPage />} />
            </Route>
          </Route>

          {/* fallback для всех остальных */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>

      <ToastContainer
        position="top-right"
        autoClose={2000}
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

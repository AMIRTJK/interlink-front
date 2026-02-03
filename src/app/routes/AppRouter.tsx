import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppRoutes } from "@shared/config/AppRoutes";
import { tokenControl } from "@shared/lib";
import { ToastContainer } from "react-toastify";
import { Suspense, lazy } from "react";
import { Loader } from "@shared/ui/Loader";
import PrivateRoute from "./PrivateRoute";

// Lazy-loaded страницы
const Auth = lazy(() =>
  import("@pages/Auth/Auth").then((m) => ({ default: m.Auth })),
);

const ProfileLayout = lazy(() =>
  import("@widgets/layout").then((m) => ({ default: m.ProfileLayout })),
);

const MainLayout = lazy(() =>
  import("@widgets/layout").then((m) => ({ default: m.MainLayout })),
);

const ProfilePage = lazy(() =>
  import("@pages/modules/profile/ProfilePage").then((m) => ({
    default: m.ProfilePage,
  })),
);

const TasksPage = lazy(() =>
  import("@pages/modules/profile/TasksPage").then((m) => ({
    default: m.TasksPage,
  })),
);
const CalendarPage = lazy(() =>
  import("@pages/modules/profile/CalendarPage").then((m) => ({
    default: m.CalendarPage,
  })),
);

const AnalyticsPage = lazy(() =>
  import("@pages/modules/profile/AnalyticsPage").then((m) => ({
    default: m.AnalyticsPage,
  })),
);

const RegistryTable = lazy(() =>
  import("@widgets/RegistryTable").then((m) => ({
    default: m.RegistryTable,
  })),
);

const CorrespondencePage = lazy(() =>
  import("@pages/modules/correspondence/CorrespondencePage").then((m) => ({
    default: m.CorrespondencePage,
  })),
);

const CreateCorrespondencePage = lazy(() =>
  import("@pages/modules/correspondence/CreateCorrespondencePage").then(
    (m) => ({ default: m.CreateCorrespondencePage }),
  ),
);

const ShowCorrespondencePage = lazy(() =>
  import("@pages/modules/correspondence/ShowCorrespondencePage").then((m) => ({
    default: m.ShowCorrespondencePage,
  })),
);

const PlaceholderPage = lazy(() =>
  import("@pages/modules/placeholderpage/PlaceholderPage").then((m) => ({
    default: m.PlaceholderPage,
  })),
);

const NotFoundPage = lazy(() =>
  import("@shared/ui/NotFoundPage/NotFoundPage").then((m) => ({
    default: m.NotFoundPage,
  })),
);

const CorrespondenceTableWrapper = lazy(() =>
  import("@widgets/RegistryTable").then((m) => ({
    default: m.CorrespondenceTableWrapper,
  })),
);

const HrPage = lazy(() =>
  import("@pages/modules/hr/Hr").then((m) => ({ default: m.HrPage })),
);

// const InternalСorrespondencePage = lazy(() =>
//   import("@pages/modules/correspondence/InternalСorrespondencePage").then(
//     (m) => ({ default: m.InternalСorrespondencePage }),
//   ),
// );

const incomingParams = {
  kind: "incoming",
  tab: "draft",
};

const outgoingParams = {
  kind: "outgoing",
  tab: "draft",
};

const archivedParams = {
  archived: 1,
};

const pinnedParams = {
  pinned: 1,
};

const trashedParams = {
  trashed: 1,
};

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
              <Route path="hr" element={<HrPage />} />
              <Route path="correspondence" element={<CorrespondencePage />}>
                <Route index element={<Navigate to="external" replace />} />
                
                {/* External Correspondence (Legacy API) */}
                <Route path="external">
                  <Route index element={<Navigate to="incoming" replace />} />
                  <Route path="incoming">
                    <Route
                      index
                      element={
                        <CorrespondenceTableWrapper
                          type="incoming"
                          createButtonText="Добавить письмо"
                          baseParams={incomingParams}
                        />
                      }
                    />
                    <Route
                      path="create"
                      element={<CreateCorrespondencePage type="incoming" />}
                    />
                    <Route
                      path=":id"
                      element={<ShowCorrespondencePage type="incoming" />}
                    />
                  </Route>
                  <Route path="outgoing">
                    <Route
                      index
                      element={
                        <CorrespondenceTableWrapper
                          type="outgoing"
                          createButtonText="Добавить письмо"
                          baseParams={outgoingParams}
                        />
                      }
                    />
                    <Route
                      path="create"
                      element={<CreateCorrespondencePage type="outgoing" />}
                    />
                    <Route
                      path=":id"
                      element={<ShowCorrespondencePage type="outgoing" />}
                    />
                  </Route>
                </Route>

                {/* Internal Correspondence (Internal API) */}
                <Route path="internal">
                  <Route index element={<Navigate to="incoming" replace />} />
                   <Route path="incoming">
                    <Route
                      index
                      element={
                        <CorrespondenceTableWrapper
                          type="internal-incoming"
                          createButtonText="Добавить письмо"
                          baseParams={{ ...incomingParams, channel: 'internal' }}
                        />
                      }
                    />
                    <Route
                      path="create"
                      element={<CreateCorrespondencePage type="internal-incoming" />}
                    />
                    <Route
                      path=":id"
                      element={<ShowCorrespondencePage type="internal-incoming" />}
                    />
                  </Route>
                  <Route path="outgoing">
                    <Route
                      index
                      element={
                        <CorrespondenceTableWrapper
                          type="internal-outgoing"
                          createButtonText="Добавить письмо"
                          baseParams={{ ...outgoingParams, channel: 'internal' }}
                        />
                      }
                    />
                    <Route
                      path="create"
                      element={<CreateCorrespondencePage type="internal-outgoing" />}
                    />
                    <Route
                      path=":id"
                      element={<ShowCorrespondencePage type="internal-outgoing" />}
                    />
                  </Route>
                </Route>
                <Route path="archive">
                  <Route
                    index
                    element={
                      <RegistryTable
                        type="archived"
                        extraParams={archivedParams}
                      />
                    }
                  />
                </Route>
                <Route path="pinned">
                  <Route
                    index
                    element={
                      <RegistryTable type="pinned" extraParams={pinnedParams} />
                    }
                  />
                </Route>
                <Route path="trashed">
                  <Route
                    index
                    element={
                      <RegistryTable
                        type="trashed"
                        extraParams={trashedParams}
                      />
                    }
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

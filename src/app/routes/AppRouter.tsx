import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppRoutes } from "@shared/config/AppRoutes";
import { ApiRoutes } from "@shared/api";
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

const InternalCorrespondenceReadPage = lazy(() =>
  import("@pages/modules/correspondence/InternalCorrespondenceRead").then(
    (m) => ({ default: m.InternalCorrespondenceRead }),
  ),
);

const RegistryTable = lazy(() =>
  import("@widgets/RegistryTable").then((m) => ({
    default: m.RegistryTable,
  })),
);

const NewRegistry = lazy(() =>
  import("@widgets/NewRegistry").then((m) => ({
    default: m.NewRegistry,
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

const NewCorrespondenceTableWrapper = lazy(() =>
  import("@widgets/NewRegistry").then((m) => ({
    default: m.NewCorrespondenceTableWrapper,
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
};

const outgoingParams = {
  kind: "outgoing",
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
                          type="external-incoming"
                          createButtonText="Добавить письмо"
                          baseParams={{
                            ...incomingParams,
                          }}
                        />
                      }
                    />
                    <Route
                      path="create"
                      element={
                        <CreateCorrespondencePage type="external-incoming" />
                      }
                    />
                    <Route
                      path=":id"
                      element={
                        <ShowCorrespondencePage type="external-incoming" />
                      }
                    />
                  </Route>
                  <Route path="outgoing">
                    <Route
                      index
                      element={
                        <CorrespondenceTableWrapper
                          type="external-outgoing"
                          createButtonText="Добавить письмо"
                          baseParams={{
                            ...outgoingParams,
                          }}
                        />
                      }
                    />
                    <Route
                      path="create"
                      element={
                        <CreateCorrespondencePage type="external-outgoing" />
                      }
                    />
                    <Route
                      path=":id"
                      element={
                        <ShowCorrespondencePage type="external-outgoing" />
                      }
                    />
                  </Route>
                </Route>

                {/* Internal Correspondence (Internal API) */}
                <Route path="internal">
                  <Route
                    path="read/:id"
                    element={
                      <Suspense fallback={<Loader />}>
                        <InternalCorrespondenceReadPage />
                      </Suspense>
                    }
                  />
                  <Route index element={<Navigate to="incoming" replace />} />
                  <Route path="incoming">
                    <Route
                      index
                      element={
                        // <CorrespondenceTableWrapper type="internal-incoming" />
                        <NewCorrespondenceTableWrapper type="internal-incoming" />
                      }
                    />
                    <Route
                      path="create"
                      element={
                        <CreateCorrespondencePage type="internal-incoming" />
                      }
                    />
                    <Route
                      path=":id"
                      element={
                        <ShowCorrespondencePage type="internal-incoming" />
                      }
                    />
                  </Route>
                  <Route path="outgoing">
                    <Route
                      index
                      element={
                        // <CorrespondenceTableWrapper
                        //   type="internal-outgoing"
                        //   createButtonText="Добавить письмо"
                        // />
                        <NewCorrespondenceTableWrapper
                          type="internal-outgoing"
                          createButtonText="Добавить"
                        />
                      }
                    />
                    <Route
                      path="create"
                      element={
                        <Suspense fallback={<Loader />}>
                          <CreateCorrespondencePage type="internal-outgoing" />
                        </Suspense>
                      }
                    />
                    <Route
                      path=":id"
                      element={
                        <Suspense fallback={<Loader />}>
                          <ShowCorrespondencePage type="internal-outgoing" />
                        </Suspense>
                      }
                    />
                  </Route>
                  <Route path="drafts">
                    <Route
                      index
                      element={
                        // <CorrespondenceTableWrapper
                        //   type="internal-drafts"
                        //   createButtonText="Добавить письмо"
                        // />
                        <NewCorrespondenceTableWrapper type="internal-drafts" />
                      }
                    />
                  </Route>
                  <Route path="archive">
                    <Route
                      index
                      element={
                        // <RegistryTable
                        //   type="internal-archived"
                        //   url={ApiRoutes.GET_INTERNAL_CORRESPONDENCES}
                        //   extraParams={archivedParams}
                        // />
                        <NewRegistry
                          type="internal-archived"
                          url={ApiRoutes.GET_INTERNAL_CORRESPONDENCES}
                          extraParams={archivedParams}
                        />
                      }
                    />
                  </Route>
                  <Route path="pinned">
                    <Route
                      index
                      element={
                        // <RegistryTable
                        //   type="internal-pinned"
                        //   url={ApiRoutes.GET_INTERNAL_CORRESPONDENCES}
                        //   extraParams={pinnedParams}
                        // />
                        <NewRegistry
                          type="internal-pinned"
                          url={ApiRoutes.GET_INTERNAL_CORRESPONDENCES}
                          extraParams={pinnedParams}
                        />
                      }
                    />
                  </Route>
                  <Route path="trashed">
                    <Route
                      index
                      element={
                        // <RegistryTable
                        //   type="internal-trashed"
                        //   url={ApiRoutes.GET_INTERNAL_TRASH}
                        // />
                        <NewRegistry
                          type="internal-trashed"
                          url={ApiRoutes.GET_INTERNAL_TRASH}
                        />
                      }
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

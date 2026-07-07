import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppRoutes } from "@shared/config/AppRoutes";
import { ApiRoutes } from "@shared/api";
import { tokenControl } from "@shared/lib";
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

const HrLayoutPage = lazy(() =>
  import("@pages/modules/hr/Hr").then((m) => ({ default: m.HrLayoutPage })),
);
const TasksModulePage = lazy(() =>
  import("@pages/modules/tasks/TasksModulePage").then((m) => ({
    default: m.TasksModulePage,
  })),
);
const HrEmployeesPage = lazy(() =>
  import("@pages/modules/hr/EmployeesPage").then((m) => ({
    default: m.HrEmployeesPage,
  })),
);
const HrAccessPage = lazy(() =>
  import("@pages/modules/hr/AccessPage").then((m) => ({
    default: m.HrAccessPage,
  })),
);
const HrOrdersPage = lazy(() =>
  import("@pages/modules/hr/OrdersPage").then((m) => ({
    default: m.HrOrdersPage,
  })),
);
const HrTimesheetPage = lazy(() =>
  import("@pages/modules/hr/TimesheetPage").then((m) => ({
    default: m.HrTimesheetPage,
  })),
);
const HrStaffingPage = lazy(() =>
  import("@pages/modules/hr/StaffingPage").then((m) => ({
    default: m.HrStaffingPage,
  })),
);

// Administration module
const AdministrationLayoutPage = lazy(() =>
  import("@pages/modules/administration/Administration").then((m) => ({
    default: m.AdministrationLayoutPage,
  })),
);
const AdministrationHomePage = lazy(() =>
  import("@pages/modules/administration/AdministrationHomePage").then((m) => ({
    default: m.AdministrationHomePage,
  })),
);
const AdminUsersPage = lazy(() =>
  import("@pages/modules/administration/AdminUsersPage").then((m) => ({
    default: m.AdminUsersPage,
  })),
);
const AdminRolesPage = lazy(() =>
  import("@pages/modules/administration/AdminRolesPage").then((m) => ({
    default: m.AdminRolesPage,
  })),
);
const AdminTabsLayout = lazy(() =>
  import("@widgets/Administration").then((m) => ({
    default: m.AdminTabsLayout,
  })),
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

import { TabNavigation } from "@widgets/TabNavigation/ui/TabNavigation";

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <TabNavigation />
      <Suspense fallback={<Loader fullScreen />}>
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
                <Route path="profile" element={<ProfilePage />} />
                <Route path="tasks" element={<TasksPage />} />
                <Route path="calendar" element={<CalendarPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="files" element={<ProfilePage />} />
              </Route>
            </Route>

            {/* Модули */}
            <Route path="/modules" element={<MainLayout />}>
              <Route path="hr" element={<HrLayoutPage />}>
                <Route index element={<Navigate to="employees" replace />} />
                <Route path="employees" element={<HrEmployeesPage />} />
                <Route path="access" element={<HrAccessPage />} />
                <Route path="orders" element={<HrOrdersPage />} />
                <Route path="timesheet" element={<HrTimesheetPage />} />
                <Route path="staffing" element={<HrStaffingPage />} />
              </Route>
              <Route path="tasks" element={<TasksModulePage />} />
              <Route
                path="administration"
                element={<AdministrationLayoutPage />}
              >
                <Route index element={<AdministrationHomePage />} />
                <Route element={<AdminTabsLayout />}>
                  <Route path="users" element={<AdminUsersPage />} />
                  <Route path="roles" element={<AdminRolesPage />} />
                </Route>
              </Route>
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
                      <Suspense fallback={<Loader fullScreen />}>
                        <InternalCorrespondenceReadPage />
                      </Suspense>
                    }
                  />
                  <Route index element={<Navigate to="incoming" replace />} />
                  <Route path="folder/:id">
                    <Route
                      index
                      element={
                        <NewCorrespondenceTableWrapper type="internal-incoming" />
                      }
                    />
                  </Route>
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
                        <Suspense fallback={<Loader fullScreen />}>
                          <CreateCorrespondencePage type="internal-outgoing" />
                        </Suspense>
                      }
                    />
                    <Route
                      path=":id"
                      element={
                        <Suspense fallback={<Loader fullScreen />}>
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

    </BrowserRouter>
  );
};

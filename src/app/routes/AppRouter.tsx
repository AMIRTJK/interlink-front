import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppRoutes } from "@shared/config/AppRoutes";
import { ApiRoutes } from "@shared/api";
import { tokenControl } from "@shared/lib";
import { Suspense } from "react";
import { Loader } from "@shared/ui/Loader";
import PrivateRoute from "./PrivateRoute";
import WelcomeRoute from "./WelcomeRoute";
import { TabNavigation } from "@widgets/TabNavigation/ui/TabNavigation";
import {
  incomingParams,
  outgoingParams,
  archivedParams,
  pinnedParams,
  trashedParams,
} from "./routesModel";
import {
  Auth,
  AuthWelcomePage,
  ProfileLayout,
  MainLayout,
  ProfilePage,
  TasksPage,
  CalendarPage,
  AnalyticsPage,
  InternalCorrespondenceReadPage,
  RegistryTable,
  NewRegistry,
  CorrespondencePage,
  CreateCorrespondencePage,
  ShowCorrespondencePage,
  PlaceholderPage,
  NotFoundPage,
  CorrespondenceTableWrapper,
  NewCorrespondenceTableWrapper,
  HrLayoutPage,
  TasksModulePage,
  HrEmployeesPage,
  HrAccessPage,
  HrOrdersPage,
  HrTimesheetPage,
  HrStaffingPage,
  AdministrationLayoutPage,
  AdministrationHomePage,
  AdminUsersPage,
  AdminRolesPage,
  AdminTabsLayout,
} from "./lazyPages";

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
                <Navigate to={AppRoutes.PROFILE} replace />
              ) : (
                <Navigate to={AppRoutes.LOGIN} replace />
              )
            }
          />

          {/* Публичный маршрут */}
          <Route path="/auth/login" element={<Auth />} />

          {/* Экран приветствия сразу после входа */}
          <Route element={<WelcomeRoute />}>
            <Route
              path={AppRoutes.AUTH_WELCOME}
              element={<AuthWelcomePage />}
            />
          </Route>

          {/* Приватные маршруты */}
          <Route element={<PrivateRoute />}>
            {/* Профиль */}
            <Route element={<ProfileLayout />}>
              <Route path="/profile" element={<ProfilePage />}>
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
                        <NewCorrespondenceTableWrapper type="internal-drafts" />
                      }
                    />
                  </Route>
                  <Route path="archive">
                    <Route
                      index
                      element={
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

import { lazy } from "react";

// Lazy-loaded страницы и макеты
export const Auth = lazy(() =>
  import("@pages/Auth/Auth").then((m) => ({ default: m.Auth })),
);

export const AuthWelcomePage = lazy(() =>
  import("@pages/Auth/AuthWelcomePage").then((m) => ({
    default: m.AuthWelcomePage,
  })),
);

export const ProfileLayout = lazy(() =>
  import("@widgets/layout").then((m) => ({ default: m.ProfileLayout })),
);

export const MainLayout = lazy(() =>
  import("@widgets/layout").then((m) => ({ default: m.MainLayout })),
);

export const ProfilePage = lazy(() =>
  import("@pages/modules/profile/ProfilePage").then((m) => ({
    default: m.ProfilePage,
  })),
);

export const TasksPage = lazy(() =>
  import("@pages/modules/profile/TasksPage").then((m) => ({
    default: m.TasksPage,
  })),
);

export const CalendarPage = lazy(() =>
  import("@pages/modules/profile/CalendarPage").then((m) => ({
    default: m.CalendarPage,
  })),
);

export const AnalyticsPage = lazy(() =>
  import("@pages/modules/profile/AnalyticsPage").then((m) => ({
    default: m.AnalyticsPage,
  })),
);

export const InternalCorrespondenceReadPage = lazy(() =>
  import("@pages/modules/correspondence/InternalCorrespondenceRead").then(
    (m) => ({ default: m.InternalCorrespondenceRead }),
  ),
);

export const RegistryTable = lazy(() =>
  import("@widgets/RegistryTable").then((m) => ({
    default: m.RegistryTable,
  })),
);

export const NewRegistry = lazy(() =>
  import("@widgets/NewRegistry").then((m) => ({
    default: m.NewRegistry,
  })),
);

export const CorrespondencePage = lazy(() =>
  import("@pages/modules/correspondence/CorrespondencePage").then((m) => ({
    default: m.CorrespondencePage,
  })),
);

export const CreateCorrespondencePage = lazy(() =>
  import("@pages/modules/correspondence/CreateCorrespondencePage").then(
    (m) => ({ default: m.CreateCorrespondencePage }),
  ),
);

export const ShowCorrespondencePage = lazy(() =>
  import("@pages/modules/correspondence/ShowCorrespondencePage").then((m) => ({
    default: m.ShowCorrespondencePage,
  })),
);

export const PlaceholderPage = lazy(() =>
  import("@pages/modules/placeholderpage/PlaceholderPage").then((m) => ({
    default: m.PlaceholderPage,
  })),
);

export const NotFoundPage = lazy(() =>
  import("@shared/ui/NotFoundPage/NotFoundPage").then((m) => ({
    default: m.NotFoundPage,
  })),
);

export const CorrespondenceTableWrapper = lazy(() =>
  import("@widgets/RegistryTable").then((m) => ({
    default: m.CorrespondenceTableWrapper,
  })),
);

export const NewCorrespondenceTableWrapper = lazy(() =>
  import("@widgets/NewRegistry").then((m) => ({
    default: m.NewCorrespondenceTableWrapper,
  })),
);

export const HrLayoutPage = lazy(() =>
  import("@pages/modules/hr/Hr").then((m) => ({ default: m.HrLayoutPage })),
);

export const TasksModulePage = lazy(() =>
  import("@pages/modules/tasks/TasksModulePage").then((m) => ({
    default: m.TasksModulePage,
  })),
);

export const HrEmployeesPage = lazy(() =>
  import("@pages/modules/hr/EmployeesPage").then((m) => ({
    default: m.HrEmployeesPage,
  })),
);

export const HrAccessPage = lazy(() =>
  import("@pages/modules/hr/AccessPage").then((m) => ({
    default: m.HrAccessPage,
  })),
);

export const HrOrdersPage = lazy(() =>
  import("@pages/modules/hr/OrdersPage").then((m) => ({
    default: m.HrOrdersPage,
  })),
);

export const HrTimesheetPage = lazy(() =>
  import("@pages/modules/hr/TimesheetPage").then((m) => ({
    default: m.HrTimesheetPage,
  })),
);

export const HrStaffingPage = lazy(() =>
  import("@pages/modules/hr/StaffingPage").then((m) => ({
    default: m.HrStaffingPage,
  })),
);

export const ChatModulePage = lazy(() =>
  import("@pages/modules/chat/ChatModulePage").then((m) => ({
    default: m.ChatModulePage,
  })),
);

export const AdministrationLayoutPage = lazy(() =>
  import("@pages/modules/administration/Administration").then((m) => ({
    default: m.AdministrationLayoutPage,
  })),
);

export const AdministrationHomePage = lazy(() =>
  import("@pages/modules/administration/AdministrationHomePage").then((m) => ({
    default: m.AdministrationHomePage,
  })),
);

export const AdminUsersPage = lazy(() =>
  import("@pages/modules/administration/AdminUsersPage").then((m) => ({
    default: m.AdminUsersPage,
  })),
);

export const AdminRolesPage = lazy(() =>
  import("@pages/modules/administration/AdminRolesPage").then((m) => ({
    default: m.AdminRolesPage,
  })),
);

export const AdminTabsLayout = lazy(() =>
  import("@widgets/Administration").then((m) => ({
    default: m.AdminTabsLayout,
  })),
);

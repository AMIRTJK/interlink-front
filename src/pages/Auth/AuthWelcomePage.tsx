import { AuthWelcome, TWarmupImport } from "@widgets/AuthWelcome";

const warmupImports: TWarmupImport[] = [
  () => import("@widgets/layout"),
  () => import("@pages/modules/profile/ProfilePage"),
];

export const AuthWelcomePage = () => (
  <AuthWelcome warmupImports={warmupImports} />
);

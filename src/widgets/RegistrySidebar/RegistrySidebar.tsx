import { If } from "@shared/ui";
import { CorrespondenceListSidebar, ModuleSidebar } from "./ui";

interface RegistrySidebarProps {
  isDetailView?: boolean;
}

export const RegistrySidebar = ({ isDetailView }: RegistrySidebarProps) => {
  return (
    <div className="flex h-full items-stretch">
      <div className="shrink-0">
        <ModuleSidebar />
      </div>

      <If is={isDetailView}>
        <CorrespondenceListSidebar />
      </If>
    </div>
  );
};

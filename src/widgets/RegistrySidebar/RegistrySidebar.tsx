import { If } from "@shared/ui";
import { CorrespondenceListSidebar, ModuleSidebar } from "./ui";

interface IProps {
  isDetailView?: boolean;
}

// test pull request
export const RegistrySidebar = ({ isDetailView }: IProps) => {
  return (
    <div className="flex h-full items-stretch">
      <div className="shrink-0 bg-red-500">
        <ModuleSidebar isDetailView={isDetailView} />
      </div>

      <If is={isDetailView}>
        <CorrespondenceListSidebar />
      </If>
    </div>
  );
};

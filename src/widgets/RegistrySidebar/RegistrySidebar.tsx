import React from "react";
import { If } from "@shared/ui";
import { CorrespondenceListSidebar, ModuleSidebar } from "./ui";

interface IProps {
  isDetailView?: boolean;
}
export const RegistrySidebar = React.memo(({ isDetailView }: IProps) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="w-full">
        <ModuleSidebar />
      </div>
      <If is={isDetailView}>
        <CorrespondenceListSidebar />
      </If>
    </div>
  );
});

RegistrySidebar.displayName = "RegistrySidebar";

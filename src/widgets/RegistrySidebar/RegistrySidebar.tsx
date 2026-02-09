import React from "react";
import { If } from "@shared/ui";
import { CorrespondenceListSidebar, ModuleSidebar } from "./ui";

interface IProps {
  isDetailView?: boolean;
  variant?: "horizontal" | "vertical";
}
export const RegistrySidebar = React.memo(
  ({ isDetailView, variant = "horizontal" }: IProps) => {
    return (
      <div
        className={
          variant === "horizontal" ? "flex flex-col gap-4" : "flex h-full"
        }
      >
        <div className={variant === "horizontal" ? "w-full" : "h-full"}>
          <ModuleSidebar variant={variant} />
        </div>
        <If is={isDetailView}>
          <CorrespondenceListSidebar variant={variant} />
        </If>
      </div>
    );
  },
);

RegistrySidebar.displayName = "RegistrySidebar";

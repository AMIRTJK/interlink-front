import React from "react";
import { If } from "@shared/ui";
import { CorrespondenceListSidebar, ModuleSidebar } from "./ui";

interface IProps {
  isDetailView?: boolean;
  variant?: "horizontal" | "vertical";
  onVariantChange?: (variant: "horizontal" | "vertical") => void;
}
export const RegistrySidebar = React.memo(
  ({ isDetailView, variant = "horizontal", onVariantChange }: IProps) => {
    return (
      <div
        className={
          variant === "horizontal" ? "flex flex-col gap-4" : "flex h-full gap-3"
        }
      >
        <div className={variant === "horizontal" ? "w-full" : "h-full"}>
          <ModuleSidebar variant={variant} onVariantChange={onVariantChange} />
        </div>
        <If is={isDetailView}>
          <CorrespondenceListSidebar variant={variant} />
        </If>
      </div>
    );
  },
);

RegistrySidebar.displayName = "RegistrySidebar";

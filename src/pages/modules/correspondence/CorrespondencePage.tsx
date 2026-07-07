import { useCorrespondenceRoute, cn } from "@shared/lib";
import { If } from "@shared/ui";
import { RegistrySidebar } from "@widgets/RegistrySidebar";
import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";

export const CorrespondencePage = () => {
  const { isDetailView, shouldHideUI } = useCorrespondenceRoute();

  const [variant, setVariant] = useState<"horizontal" | "vertical">(() => {
    return (
      (localStorage.getItem("registry-sidebar-variant") as
        | "horizontal"
        | "vertical") || "horizontal"
    );
  });

  useEffect(() => {
    localStorage.setItem("registry-sidebar-variant", variant);
  }, [variant]);

  return (
    <div
      className={cn(
        "flex w-full h-full",
        variant === "horizontal" ? "flex-col" : "flex-row",
      )}
    >
      <If is={!shouldHideUI}>
        <div className={variant === "vertical" ? "shrink-0 pr-6 pb-6" : ""}>
          <RegistrySidebar
            isDetailView={isDetailView}
            variant={variant}
            onVariantChange={setVariant}
          />
        </div>
      </If>
      <main className="flex-1 min-w-0 h-full overflow-hidden">
        <div className={cn("h-full w-full mx-auto space-y-4", !shouldHideUI && "pb-6")}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

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
        <div className={variant === "vertical" ? "shrink-0 pl-6 py-6" : ""}>
          <RegistrySidebar
            isDetailView={isDetailView}
            variant={variant}
            onVariantChange={setVariant}
          />
        </div>
      </If>
      {/* <main className="w-full min-w-0 m-4"> */}
      <main className={`w-full  mx-auto space-y-4 p-6`}>
        <Outlet />
      </main>
    </div>
  );
};

import { useState } from "react";
import { If } from "@shared/ui";
import { UsersTab } from "./ui/UsersTab";
import { RolesTab } from "./ui/RolesTab";

export const AccessWidget = () => {
  const [activeTab, setActiveTab] = useState<"users" | "roles">("users");

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-2">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab("users")}
            className={`pb-2.5 text-sm font-semibold border-b-2 transition-all duration-200 relative ${
              activeTab === "users"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            Пользователи
          </button>
          <button
            onClick={() => setActiveTab("roles")}
            className={`pb-2.5 text-sm font-semibold border-b-2 transition-all duration-200 relative ${
              activeTab === "roles"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            Роли и доступы
          </button>
        </div>
      </div>

      <div className="pt-2">
        <div className={activeTab === "users" ? "block!" : "hidden!"}>
          <UsersTab />
        </div>
        <div className={activeTab === "roles" ? "block!" : "hidden!"}>
          <RolesTab />
        </div>
      </div>
    </div>
  );
};

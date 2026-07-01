import { useState } from "react";
import { UsersTab } from "./ui/UsersTab";
import { RolesTab } from "./ui/RolesTab";
import {
	CreateOrganization,
	CreateDepartment,
	SetUserRole,
} from "@features/Hr";

export const AccessWidget = () => {
	const [activeTab, setActiveTab] = useState<
		"users" | "roles" | "orgs" | "deps" | "assign"
	>("users");

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
						{"\u041f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u0438"}
					</button>
					<button
						onClick={() => setActiveTab("roles")}
						className={`pb-2.5 text-sm font-semibold border-b-2 transition-all duration-200 relative ${
							activeTab === "roles"
								? "border-blue-600 text-blue-600"
								: "border-transparent text-slate-400 hover:text-slate-600"
						}`}
					>
						{"\u0420\u043e\u043b\u0438 \u0438 \u0434\u043e\u0441\u0442\u0443\u043f\u044b"}
					</button>
					<button
						onClick={() => setActiveTab("orgs")}
						className={`pb-2.5 text-sm font-semibold border-b-2 transition-all duration-200 relative ${
							activeTab === "orgs"
								? "border-blue-600 text-blue-600"
								: "border-transparent text-slate-400 hover:text-slate-600"
						}`}
					>
						{"\u041e\u0440\u0433\u0430\u043d\u0438\u0437\u0430\u0446\u0438\u0438"}
					</button>
					<button
						onClick={() => setActiveTab("deps")}
						className={`pb-2.5 text-sm font-semibold border-b-2 transition-all duration-200 relative ${
							activeTab === "deps"
								? "border-blue-600 text-blue-600"
								: "border-transparent text-slate-400 hover:text-slate-600"
						}`}
					>
						{"\u041e\u0442\u0434\u0435\u043b\u044b"}
					</button>
					<button
						onClick={() => setActiveTab("assign")}
						className={`pb-2.5 text-sm font-semibold border-b-2 transition-all duration-200 relative ${
							activeTab === "assign"
								? "border-blue-600 text-blue-600"
								: "border-transparent text-slate-400 hover:text-slate-600"
						}`}
					>
						{"\u041d\u0430\u0437\u043d\u0430\u0447\u0438\u0442\u044c \u0440\u043e\u043b\u044c"}
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
				<div className={activeTab === "orgs" ? "block!" : "hidden!"}>
					<CreateOrganization />
				</div>
				<div className={activeTab === "deps" ? "block!" : "hidden!"}>
					<CreateDepartment />
				</div>
				<div className={activeTab === "assign" ? "block!" : "hidden!"}>
					<SetUserRole />
				</div>
			</div>
		</div>
	);
};

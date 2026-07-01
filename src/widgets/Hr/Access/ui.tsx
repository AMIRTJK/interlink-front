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
			<div className="bg-slate-100/50 p-1 rounded-2xl border border-slate-200/50 inline-flex items-center gap-1">
				<button
					onClick={() => setActiveTab("users")}
					className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer outline-none! focus:outline-none! border ${
						activeTab === "users"
							? "bg-white text-blue-600 shadow-sm border-slate-100/80"
							: "text-slate-500 hover:text-slate-700 hover:bg-slate-200/40 border-transparent"
					}`}
				>
					{"\u041f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u0438"}
				</button>
				<button
					onClick={() => setActiveTab("roles")}
					className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer outline-none! focus:outline-none! border ${
						activeTab === "roles"
							? "bg-white text-blue-600 shadow-sm border-slate-100/80"
							: "text-slate-500 hover:text-slate-700 hover:bg-slate-200/40 border-transparent"
					}`}
				>
					{"\u0420\u043e\u043b\u0438 \u0438 \u0434\u043e\u0441\u0442\u0443\u043f\u044b"}
				</button>
				<button
					onClick={() => setActiveTab("orgs")}
					className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer outline-none! focus:outline-none! border ${
						activeTab === "orgs"
							? "bg-white text-blue-600 shadow-sm border-slate-100/80"
							: "text-slate-500 hover:text-slate-700 hover:bg-slate-200/40 border-transparent"
					}`}
				>
					{"\u041e\u0440\u0433\u0430\u043d\u0438\u0437\u0430\u0446\u0438\u0438"}
				</button>
				<button
					onClick={() => setActiveTab("deps")}
					className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer outline-none! focus:outline-none! border ${
						activeTab === "deps"
							? "bg-white text-blue-600 shadow-sm border-slate-100/80"
							: "text-slate-500 hover:text-slate-700 hover:bg-slate-200/40 border-transparent"
					}`}
				>
					{"\u041e\u0442\u0434\u0435\u043b\u044b"}
				</button>
				<button
					onClick={() => setActiveTab("assign")}
					className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer outline-none! focus:outline-none! border ${
						activeTab === "assign"
							? "bg-white text-blue-600 shadow-sm border border-slate-100/80"
							: "text-slate-500 hover:text-slate-700 hover:bg-slate-200/40 border-transparent"
					}`}
				>
					{"\u041d\u0430\u0437\u043d\u0430\u0447\u0438\u0442\u044c \u0440\u043e\u043b\u044c"}
				</button>
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

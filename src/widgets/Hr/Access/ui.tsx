import { useState } from "react";
import { motion } from "framer-motion";
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

	const tabs = [
		{ id: "users", label: "\u041f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u0438", content: <UsersTab /> },
		{ id: "roles", label: "\u0420\u043e\u043b\u0438 \u0438 \u0434\u043e\u0441\u0442\u0443\u043f\u044b", content: <RolesTab /> },
		{ id: "orgs", label: "\u041e\u0440\u0433\u0430\u043d\u0438\u0437\u0430\u0446\u0438\u0438", content: <CreateOrganization /> },
		{ id: "deps", label: "\u041e\u0442\u0434\u0435\u043b\u044b", content: <CreateDepartment /> },
		{ id: "assign", label: "\u041d\u0430\u0437\u043d\u0430\u0447\u0438\u0442\u044c \u0440\u043e\u043b\u044c", content: <SetUserRole /> },
	] as const;

	return (
		<div className="space-y-6">
			<div className="bg-slate-100/50 p-1 rounded-2xl border border-slate-200/50 inline-flex items-center gap-1 relative z-1">
				{tabs.map((tab) => {
					const isActive = activeTab === tab.id;
					return (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={`relative px-4 py-2 text-xs font-bold rounded-xl transition-colors duration-200 cursor-pointer outline-none! focus:outline-none! border border-transparent select-none ${
								isActive ? "text-blue-600" : "text-slate-500 hover:text-slate-700"
							}`}
						>
							{isActive && (
								<motion.div
									layoutId="activeTabPill"
									className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-100/80 -z-10"
									transition={{ type: "spring", stiffness: 380, damping: 30 }}
								/>
							)}
							<span className="relative z-10">{tab.label}</span>
						</button>
					);
				})}
			</div>

			<div className="pt-2">
				{tabs.map((tab) => (
					<div
						key={tab.id}
						className={activeTab === tab.id ? "block!" : "hidden!"}
					>
						{tab.content}
					</div>
				))}
			</div>
		</div>
	);
};

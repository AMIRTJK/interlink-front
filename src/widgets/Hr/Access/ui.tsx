import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
		{ id: "users", label: "Пользователи", content: <UsersTab /> },
		{ id: "roles", label: "Роли и доступы", content: <RolesTab /> },
		{ id: "orgs", label: "Организации", content: <CreateOrganization /> },
		{ id: "deps", label: "Отделы", content: <CreateDepartment /> },
		{ id: "assign", label: "Назначить роль", content: <SetUserRole /> },
	] as const;

	const activeContent = tabs.find((t) => t.id === activeTab)?.content;

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

			<div className="pt-2 relative">
				<AnimatePresence mode="popLayout">
					<motion.div
						key={activeTab}
						initial={{ opacity: 0, y: 4 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -4 }}
						transition={{ duration: 0.15, ease: "easeOut" }}
					>
						{activeContent}
					</motion.div>
				</AnimatePresence>
			</div>
		</div>
	);
};

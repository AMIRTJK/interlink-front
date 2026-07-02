import { useState, useEffect, useMemo } from "react";
import { Switch, Input } from "antd";
import { Check, X, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetQuery, useMutationQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { IAccessUser } from "../model";
import { extractPermNames, getInitials } from "../lib";

interface IProps {
	user: IAccessUser | null;
	allSystemPermissions: string[];
	onClose: () => void;
}

const MODULE_TRANSLATIONS: Record<string, string> = {
	profile: "Личный кабинет",
	users: "Персонал",
	roles: "Роли",
	permissions: "Права доступа",
	organizations: "Организации",
	departments: "Отделы",
	tasks: "Чат / Задачи",
	events: "События",
	correspondence: "Корреспонденция",
	internal_correspondence: "Внутренняя корреспонденция",
	signatures: "Подписи",
	analytics: "Аналитика",
	approvals: "Согласования",
	system: "Системные функции",
};

const ACTION_TRANSLATIONS: Record<string, string> = {
	view: "Просмотр",
	create: "Создание",
	update: "Редактирование",
	delete: "Удаление",
	manage_ui: "Управление UI",
	register: "Регистрация",
	assign: "Назначение",
	"assignment.update_status": "Изменение статуса",
	view_all: "Просмотр всех",
	update_all: "Обновление всех",
	"assignment.update_any": "Обновление любого",
	edit_own: "Собственное",
	"folder.view": "Просмотр папок",
	"folder.manage": "Управление папок",
	sign: "Подписание",
	reject: "Отклонение",
	export: "Экспорт",
	"logs.view": "Просмотр логов",
};

export const UserPermissionsSidebar = ({
	user,
	allSystemPermissions,
	onClose,
}: IProps) => {
	const [directPermissionsState, setDirectPermissionsState] = useState<
		string[]
	>([]);
	const [deniedPermissionsState, setDeniedPermissionsState] = useState<
		string[]
	>([]);
	const [roleGrantedPermissions, setRoleGrantedPermissions] = useState<
		string[]
	>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [sidebarPage, setSidebarPage] = useState(1);

	useEffect(() => {
		setSidebarPage(1);
	}, [user, searchQuery]);

	const userPermsUrl = user
		? ApiRoutes.GET_USER_PERMISSIONS.replace(":id", String(user.id))
		: undefined;

	const { data: userPermsData } = useGetQuery({
		url: userPermsUrl,
		useToken: true,
		options: {
			enabled: !!user,
			refetchOnWindowFocus: false,
			staleTime: 0,
		},
	});

	useEffect(() => {
		const rawUserPerms = userPermsData?.data || userPermsData;
		setRoleGrantedPermissions(extractPermNames(rawUserPerms?.role_permissions));
		setDirectPermissionsState(extractPermNames(rawUserPerms?.direct_permissions));
		setDeniedPermissionsState(extractPermNames(rawUserPerms?.denied_permissions));
	}, [userPermsData]);

	const updateDirectM = useMutationQuery({
		url: () =>
			user
				? ApiRoutes.UPDATE_USER_DIRECT_PERMISSIONS.replace(":id", String(user.id))
				: "",
		method: "PUT",
		messages: {
			success: "Прямые права сохранены",
			suppressSuccessToast: true,
			invalidate: [ApiRoutes.GET_USERS, userPermsUrl || ""],
		},
	});

	const updateDeniedM = useMutationQuery({
		url: () =>
			user
				? ApiRoutes.UPDATE_USER_DENIED_PERMISSIONS.replace(":id", String(user.id))
				: "",
		method: "PUT",
		messages: {
			success: "Права пользователя сохранены",
			invalidate: [ApiRoutes.GET_USERS, userPermsUrl || ""],
		},
	});

	const handleToggleDirect = (permissionName: string) => {
		setDirectPermissionsState((prev) =>
			prev.includes(permissionName)
				? prev.filter((p) => p !== permissionName)
				: [...prev, permissionName],
		);
	};

	const handleToggleDenied = (permissionName: string) => {
		setDeniedPermissionsState((prev) =>
			prev.includes(permissionName)
				? prev.filter((p) => p !== permissionName)
				: [...prev, permissionName],
		);
	};

	const handleSave = () => {
		updateDirectM.mutate(
			{ permissions: directPermissionsState },
			{
				onSuccess: () => {
					updateDeniedM.mutate({ permissions: deniedPermissionsState });
				},
			},
		);
	};

	const filteredGroups = useMemo(() => {
		const groups: Record<string, { label: string; name: string }[]> = {};
		const query = searchQuery.toLowerCase();

		allSystemPermissions.forEach((permName) => {
			const parts = permName.split(".");
			const moduleName = parts[0];
			const actionName = parts.slice(1).join(".");
			const label = ACTION_TRANSLATIONS[actionName] || actionName;

			const moduleTitle = MODULE_TRANSLATIONS[moduleName] || moduleName;
			const matchesModule = moduleTitle.toLowerCase().includes(query);
			const matchesAction =
				label.toLowerCase().includes(query) ||
				permName.toLowerCase().includes(query);

			if (query && !matchesModule && !matchesAction) {
				return;
			}

			if (!groups[moduleName]) {
				groups[moduleName] = [];
			}
			groups[moduleName].push({
				label,
				name: permName,
			});
		});
		return groups;
	}, [allSystemPermissions, searchQuery]);

	const paginatedGroups = useMemo(() => {
		const entries = Object.entries(filteredGroups);
		const start = (sidebarPage - 1) * 3;
		return entries.slice(start, start + 3);
	}, [filteredGroups, sidebarPage]);

	const totalSidebarPages = useMemo(() => {
		const entries = Object.entries(filteredGroups);
		return Math.ceil(entries.length / 3);
	}, [filteredGroups]);

	if (!user) return null;

	const initials = getInitials(user.fullName);

	return (
		<div className="w-[320px] bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col h-[750px]! justify-between relative overflow-hidden">
			<AnimatePresence mode="wait">
				<motion.div
					key={user.id}
					initial={{ opacity: 0, y: 6 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -6 }}
					transition={{ duration: 0.15, ease: "easeOut" }}
					className="flex flex-col h-full w-full justify-between"
				>
					<div className="p-5 border-b border-slate-50 flex items-start justify-between">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold bg-blue-50 text-blue-600">
								{initials || "П"}
							</div>
							<div>
								<h4 className="font-bold text-slate-800 text-sm leading-tight">
									{user.fullName}
								</h4>
								<p className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">
									{user.roles.join(", ") || "Без роли"}
								</p>
							</div>
						</div>
						<button
							onClick={onClose}
							className="p-1 rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
						>
							<X size={16} />
						</button>
					</div>

					<div className="px-5 pt-4">
						<Input
							placeholder="Поиск прав..."
							prefix={<Search size={14} className="text-slate-400" />}
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							allowClear
							className="rounded-xl! border-slate-200!"
						/>
					</div>

					<div className="flex-1 overflow-y-auto p-5 space-y-4 pt-2">
						<div className="flex items-center justify-between pl-1">
							<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
								{"ПРАВА ПОЛЬЗОВАТЕЛЯ"}
							</p>
							{Object.keys(filteredGroups).length > 0 && (
								<span className="text-[10px] text-slate-400 font-bold bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100/60">
									{sidebarPage} / {totalSidebarPages || 1}
								</span>
							)}
						</div>

						<div className="space-y-4">
							{paginatedGroups.map(([moduleName, actions]) => (
								<div
									key={moduleName}
									className="border border-slate-50 rounded-xl p-3 bg-slate-50/20 space-y-2.5"
								>
									<h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-0.5 leading-none">
										{MODULE_TRANSLATIONS[moduleName] || moduleName}
									</h5>
									<div className="space-y-2">
										{actions?.map((act) => {
											const inRole = roleGrantedPermissions.includes(act.name);
											const isDenied = deniedPermissionsState.includes(act.name);
											const isDirect = directPermissionsState.includes(act.name);
											const checked = inRole ? !isDenied : isDirect;
											return (
												<div
													key={act.name}
													className="flex items-center justify-between"
												>
													<span className="text-xs font-semibold text-slate-600">
														{act.label}
													</span>
													<Switch
														size="small"
														checked={checked}
														onChange={() =>
															inRole
																? handleToggleDenied(act.name)
																: handleToggleDirect(act.name)
														}
													/>
												</div>
											);
										})}
									</div>
								</div>
							))}

							{Object.keys(filteredGroups).length === 0 && (
								<div className="text-center py-6 text-xs text-slate-400 font-medium">
									Ничего не найдено
								</div>
							)}
						</div>

						{totalSidebarPages > 1 &&
							(() => {
								const pagesList: number[] = [];
								const pageLimit = 4;
								let start = Math.max(1, sidebarPage - 1);
								let end = Math.min(totalSidebarPages, start + pageLimit - 1);
								if (end - start + 1 < pageLimit) {
									start = Math.max(1, end - pageLimit + 1);
								}
								for (let i = start; i <= end; i++) {
									pagesList.push(i);
								}

								return (
									<div className="flex justify-center pt-2">
										<div className="flex items-center gap-1">
											<button
												onClick={() =>
													setSidebarPage(Math.max(1, sidebarPage - 1))
												}
												disabled={sidebarPage === 1}
												className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer bg-white"
											>
												<svg
													width="12"
													height="12"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													strokeWidth="2.5"
													strokeLinecap="round"
													strokeLinejoin="round"
												>
													<path d="M15 18l-6-6 6-6" />
												</svg>
											</button>
											{pagesList.map((p) => (
												<button
													key={p}
													onClick={() => setSidebarPage(p)}
													className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
														sidebarPage === p
															? "bg-blue-600 text-white border border-blue-600 shadow-sm"
															: "bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
													}`}
												>
													{p}
												</button>
											))}
											<button
												onClick={() =>
													setSidebarPage(
														Math.min(totalSidebarPages, sidebarPage + 1),
													)
												}
												disabled={sidebarPage === totalSidebarPages}
												className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer bg-white"
											>
												<svg
													width="12"
													height="12"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													strokeWidth="2.5"
													strokeLinecap="round"
													strokeLinejoin="round"
												>
													<path d="M9 18l6-6-6-6" />
												</svg>
											</button>
										</div>
									</div>
								);
							})()}
					</div>

					<div className="p-4 border-t border-slate-50 bg-slate-50/20">
						<button
							onClick={handleSave}
							disabled={updateDirectM.isPending || updateDeniedM.isPending}
							className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60 transition-colors shadow-sm"
						>
							<Check size={14} />
							<span>{"Сохранить"}</span>
						</button>
					</div>
				</motion.div>
			</AnimatePresence>
		</div>
	);
};

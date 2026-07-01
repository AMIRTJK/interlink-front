import { useState, useEffect, useMemo } from "react";
import { Switch, Modal, Input, Pagination } from "antd";
import { Check, Trash2, X, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ApiRoutes } from "@shared/api";
import { useMutationQuery } from "@shared/lib";

interface IProps {
	role: {
		id: number;
		name: string;
		permissions?: string[] | { name: string }[];
	} | null;
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

export const RolePermissionsSidebar = ({
	role,
	allSystemPermissions,
	onClose,
}: IProps) => {
	const [rolePermissionsState, setRolePermissionsState] = useState<string[]>(
		[],
	);
	const [searchQuery, setSearchQuery] = useState("");
	const [sidebarPage, setSidebarPage] = useState(1);

	useEffect(() => {
		setSidebarPage(1);
	}, [role, searchQuery]);

	useEffect(() => {
		const list: string[] = [];
		if (role && Array.isArray(role.permissions)) {
			role.permissions.forEach((p: any) => {
				const name = typeof p === "string" ? p : p?.name;
				if (name) {
					list.push(name);
				}
			});
		}
		setRolePermissionsState(list);
	}, [role]);

	const updateRoleM = useMutationQuery({
		url: () =>
			role ? ApiRoutes.UPDATE_ROLE.replace(":id", String(role.id)) : "",
		method: "PUT",
		messages: {
			success: "Права роли успешно сохранены",
			invalidate: [ApiRoutes.GET_ROLES],
		},
	});

	const deleteRoleM = useMutationQuery({
		url: () =>
			role ? ApiRoutes.DELETE_ROLE.replace(":id", String(role.id)) : "",
		method: "DELETE",
		messages: {
			success: "Роль успешно удалена",
			invalidate: [ApiRoutes.GET_ROLES],
		},
	});

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
			const matchesAction = label.toLowerCase().includes(query) || permName.toLowerCase().includes(query);

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

	const handleTogglePermission = (permissionName: string) => {
		setRolePermissionsState((prev) => {
			if (prev.includes(permissionName)) {
				return prev.filter((p) => p !== permissionName);
			} else {
				return [...prev, permissionName];
			}
		});
	};

	const handleSave = () => {
		if (!role) return;
		updateRoleM.mutate(
			{ name: role.name, permissions: rolePermissionsState },
			{
				onSuccess: () => {
					onClose();
				},
			},
		);
	};

	const handleDelete = () => {
		if (!role) return;
		Modal.confirm({
			title: "Удалить роль?",
			content: "Это действие необратимо.",
			okText: "Удалить",
			okType: "danger",
			cancelText: "Отмена",
			onOk: () => {
				deleteRoleM.mutate(
					{},
					{
						onSuccess: () => {
							onClose();
						},
					},
				);
			},
		});
	};

	if (!role) return null;

	const displayName = role.name;
	const initials = displayName
		.split(" ")
		.map((n) => n[0])
		.filter(Boolean)
		.slice(0, 2)
		.join("")
		.toUpperCase();

	const colors = useMemo(() => {
		const name = role.name.toLowerCase();
		if (name.includes("администратор") || name.includes("admin")) return { bg: "bg-blue-50 text-blue-600" };
		if (name.includes("делопроизводитель") || name.includes("recipient")) return { bg: "bg-emerald-50 text-emerald-600" };
		if (name.includes("руководитель") || name.includes("signer")) return { bg: "bg-orange-50 text-orange-600" };
		if (name.includes("исполнитель") || name.includes("approval")) return { bg: "bg-indigo-50 text-indigo-600" };
		if (name.includes("контрол") || name.includes("control")) return { bg: "bg-purple-50 text-purple-600" };
		return { bg: "bg-slate-50 text-slate-500" };
	}, [role.name]);

	return (
		<div className="w-[320px] bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col h-[750px]! justify-between relative overflow-hidden">
			<AnimatePresence mode="wait">
				<motion.div
					key={role.id}
					initial={{ opacity: 0, y: 6 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -6 }}
					transition={{ duration: 0.15, ease: "easeOut" }}
					className="flex flex-col h-full w-full justify-between"
				>
					<div className="p-5 border-b border-slate-50 flex items-start justify-between">
				<div className="flex items-center gap-3">
					<div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${colors.bg}`}>
						{initials || "РД"}
					</div>
					<div>
						<h4 className="font-bold text-slate-800 text-sm leading-tight">
							{displayName}
						</h4>
						<p className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">
							{role.name}
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
						{"ПРАВА ДОСТУПА"}
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
								{actions.map((act) => {
									const checked = rolePermissionsState.includes(act.name);
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
												onChange={() => handleTogglePermission(act.name)}
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

				{totalSidebarPages > 1 && (
					<div className="flex justify-center pt-2">
						<Pagination
							current={sidebarPage}
							pageSize={3}
							total={Object.keys(filteredGroups).length}
							onChange={setSidebarPage}
							showSizeChanger={false}
							simple
							size="small"
						/>
					</div>
				)}
			</div>

			<div className="p-4 border-t border-slate-50 flex items-center justify-between gap-2.5 bg-slate-50/20">
				<button
					onClick={handleSave}
					disabled={updateRoleM.isPending}
					className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60 transition-colors shadow-sm"
				>
					<Check size={14} />
					<span>{"Сохранить"}</span>
				</button>
				<button
					onClick={handleDelete}
					disabled={deleteRoleM.isPending}
					className="flex items-center justify-center p-2.5 rounded-xl text-rose-500 hover:text-rose-600 bg-rose-50 hover:bg-rose-100/60 disabled:opacity-60 transition-colors"
				>
					<Trash2 size={15} />
				</button>
			</div>
				</motion.div>
			</AnimatePresence>
		</div>
	);
};

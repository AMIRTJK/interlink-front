import { useState, useEffect, useMemo } from "react";
import { Switch, Modal } from "antd";
import { Check, Trash2, X } from "lucide-react";
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

	const groupedPermissions = useMemo(() => {
		const groups: Record<string, { label: string; name: string }[]> = {};
		allSystemPermissions.forEach((permName) => {
			const parts = permName.split(".");
			const moduleName = parts[0];
			const actionName = parts.slice(1).join(".");
			if (!groups[moduleName]) {
				groups[moduleName] = [];
			}
			groups[moduleName].push({
				label: ACTION_TRANSLATIONS[actionName] || actionName,
				name: permName,
			});
		});
		return groups;
	}, [allSystemPermissions]);

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

			<div className="flex-1 overflow-y-auto p-5 space-y-5">
				<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 leading-none">
					{"ПРАВА ДОСТУПА"}
				</p>
				<div className="space-y-4">
					{Object.entries(groupedPermissions).map(([moduleName, actions]) => (
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
				</div>
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
		</div>
	);
};

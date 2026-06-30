import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Check, ChevronDown } from "lucide-react";
import { Dropdown, Modal, Switch } from "antd";
import type { MenuProps } from "antd";
import { useGetQuery, useMutationQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { If } from "@shared/ui";
import { IAccessUser } from "../model";
import { getInitials } from "../lib";

interface IProps {
	user: IAccessUser;
	onClose: () => void;
	onEdit: (user: IAccessUser) => void;
	onDelete: (id: number) => void;
	allRoles: {
		id: number;
		name: string;
		permissions?: string[] | { name: string }[];
	}[];
}

type TTab = "profile" | "permissions" | "sessions" | "history";

const ROLE_DOT_COLOR_MAP: Record<string, string> = {
	super_admin: "bg-blue-500!",
	recipient: "bg-green-500!",
	signer: "bg-orange-500!",
	approvaler: "bg-indigo-500!",
	controller: "bg-purple-500!",
	observer: "bg-slate-400!",
};

const ROLE_CHIP_STYLE_MAP: Record<
	string,
	{ border: string; bg: string; text: string }
> = {
	super_admin: {
		border: "border-blue-100!",
		bg: "bg-blue-50/50!",
		text: "text-blue-600!",
	},
	recipient: {
		border: "border-emerald-100!",
		bg: "bg-emerald-50/50!",
		text: "text-emerald-600!",
	},
	signer: {
		border: "border-orange-100!",
		bg: "bg-orange-50/50!",
		text: "text-orange-600!",
	},
	approvaler: {
		border: "border-indigo-100!",
		bg: "bg-indigo-50/50!",
		text: "text-indigo-600!",
	},
	controller: {
		border: "border-purple-100!",
		bg: "bg-purple-50/50!",
		text: "text-purple-600!",
	},
	observer: {
		border: "border-slate-200!",
		bg: "bg-slate-50!",
		text: "text-slate-500!",
	},
};

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
};

const ACTION_TRANSLATIONS: Record<string, string> = {
	view: "Просмотр",
	create: "Создание",
	update: "Редактирование",
	delete: "Удаление",
	manage_ui: "Управление UI",
	assign: "Назначение",
	counters: "Счетчики",
	restore: "Восстановление",
	trash: "Корзина",
	pin: "Закрепление",
	archive: "Архив",
	move: "Перемещение",
	register: "Регистрация",
	set_leader: "Назначение руководителя",
	leader_candidates: "Кандидаты в руководители",
	assignment_targets: "Цели назначения",
	assign_all: "Назначить все",
	payload: "Данные подписи",
	confirm: "Подтверждение",
	send: "Отправка",
	invite_approvals: "Приглашение согласующих",
	invite_signers: "Приглашение подписантов",
	approve: "Согласование",
	manage_participants: "Участники",
	sign: "Подписание",
	"assignment.update_status": "Обновление статуса назначения",
	"assignment.update_any": "Изменение любого назначения",
	"resolution.create": "Создание резолюции",
	"resolution.update": "Изменение резолюции",
	"resolution.close": "Закрытие резолюции",
	"approval.view": "Просмотр согласования",
	"approval.update_status": "Обновление статуса согласования",
	"approval.update_any": "Изменение любого согласования",
	"attachment.upload": "Загрузка вложений",
	"attachment.upload_bulk": "Массовая загрузка вложений",
	"attachment.delete": "Удаление вложений",
	"folder.view": "Просмотр папок",
	"folder.manage": "Управление папками",
	view_all: "Просмотр всех",
	update_all: "Обновление всех",
};

export const UserProfileModal = ({
	user,
	onClose,
	onEdit,
	onDelete,
	allRoles: rolesList,
}: IProps) => {
	const [tab, setTab] = useState<TTab>("profile");
	const [selectedRoles, setSelectedRoles] = useState<string[]>(user.roles);
	const [userPermissionsState, setUserPermissionsState] = useState<string[]>(
		[],
	);
	const [isInitialized, setIsInitialized] = useState(false);

	const { data: detailData } = useGetQuery({
		url: `${ApiRoutes.FETCH_USER_BY_ID}${user.id}`,
		useToken: true,
	});

	useEffect(() => {
		if (isInitialized) {
			return;
		}
		const rawRoles = detailData?.data?.roles || detailData?.roles;
		if (Array.isArray(rawRoles)) {
			setSelectedRoles(rawRoles?.map((r: any) => r.name));
		}
		const rawPerms = detailData?.data?.permissions || detailData?.permissions;
		const perms = new Set<string>();
		if (Array.isArray(rawPerms)) {
			rawPerms.forEach((p: any) => {
				if (typeof p === "string") {
					perms.add(p);
				} else if (p && typeof p === "object" && p.name) {
					perms.add(p.name);
				}
			});
		}
		if (Array.isArray(rawRoles)) {
			rawRoles.forEach((r: any) => {
				const matchedRoleObj = rolesList.find((item) => item.name === r.name);
				if (matchedRoleObj && matchedRoleObj.permissions) {
					if (Array.isArray(matchedRoleObj.permissions)) {
						matchedRoleObj.permissions.forEach((p: any) => {
							if (typeof p === "string") {
								perms.add(p);
							} else if (p && typeof p === "object" && p.name) {
								perms.add(p.name);
							}
						});
					}
				}
			});
		}
		if (rawRoles || rawPerms) {
			setUserPermissionsState(Array.from(perms));
			setIsInitialized(true);
		}
	}, [detailData, isInitialized, rolesList]);

	const updateRolesM = useMutationQuery({
		url: ApiRoutes.SET_USER_ROLES,
		method: "POST",
		messages: {
			success: "Права доступа успешно сохранены",
			invalidate: [
				ApiRoutes.GET_USERS,
				`${ApiRoutes.FETCH_USER_BY_ID}${user.id}`,
			],
		},
	});

	const allSystemPermissions = useMemo(() => {
		const perms = new Set<string>();
		rolesList.forEach((role) => {
			if (Array.isArray(role.permissions)) {
				role.permissions.forEach((p) => {
					if (typeof p === "string") {
						perms.add(p);
					} else if (p && typeof p === "object" && p.name) {
						perms.add(p.name);
					}
				});
			}
		});
		return Array.from(perms);
	}, [rolesList]);

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
		setUserPermissionsState((prev) => {
			if (prev.includes(permissionName)) {
				return prev.filter((p) => p !== permissionName);
			} else {
				return [...prev, permissionName];
			}
		});
	};

	const handleResetToStandard = () => {
		const perms = new Set<string>();
		selectedRoles.forEach((roleName) => {
			const roleObj = rolesList.find((r) => r.name === roleName);
			if (roleObj && roleObj.permissions) {
				if (Array.isArray(roleObj.permissions)) {
					roleObj.permissions.forEach((p) => {
						if (typeof p === "string") {
							perms.add(p);
						} else if (p && typeof p === "object" && p.name) {
							perms.add(p.name);
						}
					});
				}
			}
		});
		setUserPermissionsState(Array.from(perms));
	};

	const availableRolesToAdd = useMemo(() => {
		return rolesList.filter((r) => !selectedRoles.includes(r.name));
	}, [rolesList, selectedRoles]);

	const dropdownItems: MenuProps["items"] = useMemo(() => {
		return availableRolesToAdd.map((r) => ({
			key: r.name,
			label: (
				<div className="flex items-center gap-2">
					<span
						className={`w-1.5 h-1.5 rounded-full ${ROLE_DOT_COLOR_MAP[r.name] || "bg-slate-400!"}`}
					/>
					<span>{r.name}</span>
				</div>
			),
			onClick: () => handleAddRole(r.name),
		}));
	}, [availableRolesToAdd]);

	const handleAddRole = (roleName: string) => {
		setSelectedRoles((prev) => [...prev, roleName]);
	};

	const handleRemoveRole = (roleName: string) => {
		setSelectedRoles((prev) => prev.filter((r) => r !== roleName));
	};

	const handleSave = () => {
		updateRolesM.mutate(
			{ user_id: user.id, roles: selectedRoles },
			{
				onSuccess: () => {
					onClose();
				},
			},
		);
	};

	const handleDeleteConfirm = () => {
		Modal.confirm({
			title: "Удалить сотрудника?",
			content: "Это действие необратимо.",
			okText: "Удалить",
			okType: "danger",
			cancelText: "Отмена",
			onOk: () => {
				onDelete(user.id);
				onClose();
			},
		});
	};

	const selectOptions = useMemo(() => {
		return availableRolesToAdd.map((r) => ({
			value: r.name,
			label: (
				<div className="flex items-center gap-2">
					<span
						className={`w-1.5 h-1.5 rounded-full ${ROLE_DOT_COLOR_MAP[r.name] || "bg-slate-400!"}`}
					/>
					<span>{r.name}</span>
				</div>
			),
		}));
	}, [availableRolesToAdd]);

	const actionItems: MenuProps["items"] = [
		{
			key: "edit",
			label: "Редактировать сотрудника",
			onClick: () => {
				onClose();
				onEdit(user);
			},
		},
		{
			key: "delete",
			label: "Удалить сотрудника",
			danger: true,
			onClick: handleDeleteConfirm,
		},
	];

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="fixed inset-0! z-9998! bg-slate-900/40! backdrop-blur-sm! flex! items-center! justify-center! p-4!"
			onClick={onClose}
		>
			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				exit={{ opacity: 0, scale: 0.95 }}
				transition={{ duration: 0.2 }}
				onClick={(ev) => ev.stopPropagation()}
				className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col min-h-[800px]! max-h-[820px]!"
			>
				<div className="px-6 pt-5 pb-4 border-b border-slate-100">
					<div className="flex items-start justify-between">
						<div className="flex items-center gap-4">
							<div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold bg-blue-600 text-white">
								{getInitials(user.fullName)}
							</div>
							<div>
								<div className="flex items-center gap-2">
									<h3 className="text-xl font-bold text-slate-800">
										{user.fullName}
									</h3>
									<span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600">
										Активен
									</span>
								</div>
								<p className="text-sm text-slate-500 font-medium">
									{user.raw.position || "Сотрудник"}
								</p>
								<p className="text-xs text-slate-400 mt-1 font-normal">
									{user.email} &bull; {user.department} &bull; С {user.joinedAt}
								</p>
							</div>
						</div>
						<button
							onClick={onClose}
							className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
						>
							<X size={20} />
						</button>
					</div>
				</div>

				<div className="px-6 pt-3 border-b border-slate-100">
					<div className="flex items-center gap-4">
						<button
							onClick={() => setTab("profile")}
							className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
								tab === "profile"
									? "border-blue-600 text-blue-600"
									: "border-transparent text-slate-500 hover:text-slate-700"
							}`}
						>
							Профиль
						</button>
						<button
							onClick={() => setTab("permissions")}
							className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
								tab === "permissions"
									? "border-blue-600 text-blue-600"
									: "border-transparent text-slate-500 hover:text-slate-700"
							}`}
						>
							Права доступа
						</button>
						<button
							onClick={() => setTab("sessions")}
							className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
								tab === "sessions"
									? "border-blue-600 text-blue-600"
									: "border-transparent text-slate-500 hover:text-slate-700"
							}`}
						>
							Сессии
						</button>
						<button
							onClick={() => setTab("history")}
							className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
								tab === "history"
									? "border-blue-600 text-blue-600"
									: "border-transparent text-slate-500 hover:text-slate-700"
							}`}
						>
							История
						</button>
					</div>
				</div>

				<div className="px-6 py-6 overflow-y-auto flex-1">
					<If is={tab === "profile"}>
						<div className="space-y-6">
							<div className="grid grid-cols-3 gap-4">
								<div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/30 flex flex-col justify-center">
									<div className="text-2xl font-bold text-slate-800">142</div>
									<div className="text-xs text-slate-400 font-medium mt-1">
										Документов
									</div>
								</div>
								<div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/30 flex flex-col justify-center">
									<div className="text-2xl font-bold text-slate-800">38</div>
									<div className="text-xs text-slate-400 font-medium mt-1">
										Поручений
									</div>
								</div>
								<div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/30 flex flex-col justify-center">
									<div className="text-2xl font-bold text-slate-800">3</div>
									<div className="text-xs text-slate-400 font-medium mt-1">
										Сессий
									</div>
								</div>
							</div>

							<div className="border border-slate-100 rounded-2xl p-5 space-y-3">
								<h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
									Роли пользователя
								</h4>
								<div className="flex flex-wrap gap-2 items-center">
									{selectedRoles.map((role) => {
										const style = ROLE_CHIP_STYLE_MAP[role] || {
											border: "border-blue-100!",
											bg: "bg-blue-50/50!",
											text: "text-blue-600!",
										};
										return (
											<div
												key={role}
												className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-sm font-medium border ${style.border} ${style.bg} ${style.text}`}
											>
												<span>{role}</span>
												<button
													onClick={() => handleRemoveRole(role)}
													className="opacity-75 hover:opacity-100 font-bold ml-1 text-xs transition-opacity"
												>
													&times;
												</button>
											</div>
										);
									})}
								</div>
								<div className="pt-1">
									<Dropdown
										menu={{ items: dropdownItems }}
										trigger={["click"]}
										disabled={availableRolesToAdd.length === 0}
										getPopupContainer={(triggerNode) =>
											triggerNode.parentElement || document.body
										}
									>
										<button
											type="button"
											className="px-3 py-1 border border-dashed border-slate-300 hover:border-blue-500 hover:text-blue-600 rounded-xl text-sm text-slate-500 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50! disabled:cursor-not-allowed!"
										>
											<span>+ Добавить роль</span>
											<ChevronDown size={14} className="text-slate-400" />
										</button>
									</Dropdown>
								</div>
							</div>
						</div>
					</If>
					<If is={tab === "permissions"}>
						<div className="space-y-6">
							<div className="flex items-center justify-between">
								<div className="flex flex-wrap gap-2 items-center">
									{selectedRoles.map((role) => {
										const style = ROLE_CHIP_STYLE_MAP[role] || {
											border: "border-blue-100!",
											bg: "bg-blue-50/50!",
											text: "text-blue-600!",
										};
										return (
											<div
												key={role}
												className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-sm font-medium border ${style.border} ${style.bg} ${style.text}`}
											>
												<span
													className={`w-1.5 h-1.5 rounded-full ${ROLE_DOT_COLOR_MAP[role] || "bg-slate-400!"}`}
												/>
												<span>{role}</span>
											</div>
										);
									})}
								</div>
								<button
									type="button"
									onClick={handleResetToStandard}
									className="text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors border-b border-dashed border-slate-300 hover:border-slate-500 cursor-pointer"
								>
									Сбросить до стандарта
								</button>
							</div>

							<div className="space-y-5">
								{Object.entries(groupedPermissions).map(
									([moduleName, actions]) => (
										<div key={moduleName} className="space-y-2">
											<h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">
												{MODULE_TRANSLATIONS[moduleName] || moduleName}
											</h4>
											<div className="bg-slate-50/40! border border-slate-100! rounded-2xl! p-4! flex! flex-wrap! items-center! gap-x-8! gap-y-3!">
												{actions.map((act) => {
													const checked = userPermissionsState.includes(
														act.name,
													);
													return (
														<div
															key={act.name}
															className="flex items-center gap-3"
														>
															<span className="text-sm font-medium text-slate-600">
																{act.label}
															</span>
															<Switch
																checked={checked}
																onChange={() =>
																	handleTogglePermission(act.name)
																}
															/>
														</div>
													);
												})}
											</div>
										</div>
									),
								)}
							</div>
						</div>
					</If>
					<If is={tab !== "profile" && tab !== "permissions"}>
						<div className="py-12 text-center text-slate-400 text-sm">
							Раздел находится в разработке
						</div>
					</If>
				</div>

				<div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
					<Dropdown
						menu={{ items: actionItems }}
						trigger={["click"]}
						placement="topRight"
					>
						<button className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5">
							<span>Действие</span>
							<ChevronDown size={16} className="text-slate-400" />
						</button>
					</Dropdown>
					<button
						onClick={handleSave}
						disabled={updateRolesM.isPending}
						className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60 transition-colors"
					>
						<Check size={16} />
						<span>Сохранить изменения</span>
					</button>
				</div>
			</motion.div>
		</motion.div>
	);
};

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Check, ChevronDown, Mail, Phone, Building2, Calendar } from "lucide-react";
import { Dropdown, Modal, Switch, ConfigProvider } from "antd";
import type { MenuProps } from "antd";
import { useGetQuery, useMutationQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { If } from "@shared/ui";
import { IAccessUser, ACCESS_STATUS_META } from "../model";
import { getInitials, formatJoinedDate } from "../lib";

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
	reject: "Отклонение",
	export: "Экспорт",
	"logs.view": "Просмотр логов",
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
	const [permissionsPage, setPermissionsPage] = useState(1);
	const [accessPage, setAccessPage] = useState(1);

	const { data: detailData } = useGetQuery({
		url: `${ApiRoutes.FETCH_USER_BY_ID}${user.id}`,
		useToken: true,
		options: {
			refetchOnWindowFocus: false,
			staleTime: 5 * 60 * 1000,
		},
	});

	const { data: allPermsData } = useGetQuery({
		url: ApiRoutes.FETCH_PERMISSIONS,
		useToken: true,
		options: {
			refetchOnWindowFocus: false,
			staleTime: 30 * 60 * 1000,
		},
	});

	useEffect(() => {
		if (isInitialized || !detailData || rolesList.length === 0) {
			return;
		}
		const rawRoles = detailData?.data?.roles || detailData?.roles;
		const roleNames: string[] = [];
		if (Array.isArray(rawRoles)) {
			rawRoles.forEach((r: any) => {
				const name = typeof r === "string" ? r : r?.name;
				if (name) {
					roleNames.push(name);
				}
			});
			setSelectedRoles(roleNames);
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
		roleNames.forEach((roleName) => {
			const matchedRoleObj = rolesList.find((item) => item.name === roleName);
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
		setUserPermissionsState(Array.from(perms));
		setIsInitialized(true);
	}, [detailData, isInitialized, rolesList]);

	const updateRolesM = useMutationQuery({
		url: ApiRoutes.SET_USER_ROLES,
		method: "POST",
		messages: {
			success: "Роли успешно сохранены",
			invalidate: [
				ApiRoutes.GET_USERS,
				`${ApiRoutes.FETCH_USER_BY_ID}${user.id}`,
			],
		},
	});

	const updatePermissionsM = useMutationQuery({
		url: ApiRoutes.ASSIGN_USER_PERMISSIONS,
		method: "POST",
		messages: {
			success: "Права доступа успешно сохранены",
			invalidate: [
				ApiRoutes.GET_USERS,
				`${ApiRoutes.FETCH_USER_BY_ID}${user.id}`,
			],
		},
	});
	const updateStatusM = useMutationQuery({
		url: () => ApiRoutes.UPDATE_USER.replace(":id", String(user.id)),
		method: "PUT",
		messages: {
			success: "Статус сотруника обновлен",
			invalidate: [
				ApiRoutes.GET_USERS,
				`${ApiRoutes.FETCH_USER_BY_ID}${user.id}`,
			],
		},
	});

	const allSystemPermissions = useMemo(() => {
		const perms = new Set<string>();
		const rawSystem = allPermsData?.data || allPermsData;
		if (Array.isArray(rawSystem)) {
			rawSystem.forEach((p: any) => {
				const name = typeof p === "string" ? p : p?.name;
				if (name) {
					perms.add(name);
				}
			});
		}
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
	}, [allPermsData, rolesList]);

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

	const PAGE_SIZE = 4;

	const paginatedGroupEntries = useMemo(() => {
		const entries = Object.entries(groupedPermissions);
		const start = (permissionsPage - 1) * PAGE_SIZE;
		return entries.slice(start, start + PAGE_SIZE);
	}, [groupedPermissions, permissionsPage]);

	const ACCESS_PAGE_SIZE = 6;

	const relevantPermissions = useMemo(() => {
		const activeModules = new Set(userPermissionsState.map((p) => p.split(".")[0]));
		return allSystemPermissions.filter((perm) => activeModules.has(perm.split(".")[0]));
	}, [allSystemPermissions, userPermissionsState]);

	const paginatedAccessLevels = useMemo(() => {
		const start = (accessPage - 1) * ACCESS_PAGE_SIZE;
		return relevantPermissions.slice(start, start + ACCESS_PAGE_SIZE);
	}, [relevantPermissions, accessPage]);

	useEffect(() => {
		setAccessPage(1);
	}, [relevantPermissions]);

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
		setSelectedRoles((prev) => {
			const nextRoles = [...prev, roleName];
			const roleObj = rolesList.find((r) => r.name === roleName);
			if (roleObj && roleObj.permissions) {
				const rolePerms = Array.isArray(roleObj.permissions)
					? roleObj.permissions.map((p: any) => (typeof p === "string" ? p : p?.name)).filter(Boolean)
					: [];
				setUserPermissionsState((prevPerms) => Array.from(new Set([...prevPerms, ...rolePerms])));
			}
			return nextRoles;
		});
	};

	const handleRemoveRole = (roleName: string) => {
		setSelectedRoles((prev) => {
			const nextRoles = prev.filter((r) => r !== roleName);
			const perms = new Set<string>();
			nextRoles.forEach((rName) => {
				const roleObj = rolesList.find((r) => r.name === rName);
				if (roleObj && roleObj.permissions) {
					if (Array.isArray(roleObj.permissions)) {
						roleObj.permissions.forEach((p: any) => {
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
			return nextRoles;
		});
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

	const handleSavePermissions = () => {
		updatePermissionsM.mutate(
			{ user_id: user.id, permissions: userPermissionsState },
			{
				onSuccess: () => {
					onClose();
				},
			},
		);
	};

	const handleUpdateStatus = (status: string) => {
		updateStatusM.mutate({ status });
	};

	const handleDeleteConfirm = () => {
		Modal.confirm({
			title: "Удалить сотрудника?",
			content: "Это действие необратимо.",
			okText: "Удалить",
			okType: "danger",
			cancelText: "Отмена",
			zIndex: 10005,
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

	const rawDetail = detailData?.data || detailData;

	const currentStatus = rawDetail?.status || user.status;
	const statusMeta = ACCESS_STATUS_META[currentStatus] || ACCESS_STATUS_META.active;

	const currentFullName = rawDetail?.full_name || rawDetail?.fullName || user.fullName;
	const currentEmail = rawDetail?.email || rawDetail?.phone || user.email;
	const currentDepartment = rawDetail?.departments?.[0]?.name || rawDetail?.department?.name || rawDetail?.organization?.name || user.department;
	const currentPosition = rawDetail?.position || user.raw?.position || "Сотрудник";
	const currentJoinedAt = rawDetail?.created_at || user.raw?.created_at;
	const formattedJoinedAt = currentJoinedAt ? formatJoinedDate(currentJoinedAt) : user.joinedAt;

	const subtitleParts = [
		currentEmail && currentEmail !== "—" && currentEmail,
		currentDepartment && currentDepartment !== "—" && currentDepartment,
		formattedJoinedAt && `С ${formattedJoinedAt}`,
	].filter(Boolean);

	const renderStatusItem = (statusKey: string, labelText: string) => {
		const meta = ACCESS_STATUS_META[statusKey] || { dotClass: "bg-slate-400!" };
		const isActive = currentStatus === statusKey;
		return (
			<div className="flex items-center justify-between w-full min-w-[150px] py-0.5 select-none">
				<div className="flex items-center gap-2">
					<span className={`w-1.5 h-1.5 rounded-full ${meta.dotClass}`} />
					<span className={isActive ? "font-bold text-slate-800" : "text-slate-600 font-medium"}>
						{labelText}
					</span>
				</div>
				{isActive && <Check size={14} className="text-blue-500! ml-4" />}
			</div>
		);
	};

	const actionItems: MenuProps["items"] = [
		{
			key: "edit",
			label: <span className="font-semibold text-slate-700">Редактировать сотрудника</span>,
			onClick: () => {
				onClose();
				onEdit(user);
			},
		},
		{
			type: "divider",
		},
		{
			key: "status_active",
			label: renderStatusItem("active", "Активен"),
			onClick: () => handleUpdateStatus("active"),
		},
		{
			key: "status_inactive",
			label: renderStatusItem("inactive", "Неактивен"),
			onClick: () => handleUpdateStatus("inactive"),
		},
		{
			key: "status_vacation",
			label: renderStatusItem("vacation", "В отпуске"),
			onClick: () => handleUpdateStatus("vacation"),
		},
		{
			key: "status_business_trip",
			label: renderStatusItem("business_trip", "В командировке"),
			onClick: () => handleUpdateStatus("business_trip"),
		},
		{
			type: "divider",
		},
		{
			key: "delete",
			label: <span className="font-semibold">Удалить сотрудника</span>,
			danger: true,
			onClick: handleDeleteConfirm,
		},
	];

	return (
		<ConfigProvider theme={{ token: { zIndexPopupBase: 10000 } }}>
			<div
				className="fixed inset-0! z-9998! bg-slate-900/40! backdrop-blur-sm! flex! items-center! justify-center! p-4!"
				onClick={onClose}
			>
				<div
					onClick={(ev) => ev.stopPropagation()}
					className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col min-h-[800px]! max-h-[820px]!"
				>
				<div className="px-6 pt-5 pb-4 border-b border-slate-100">
					<div className="flex items-start justify-between">
						<div className="flex items-center gap-4">
							<div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold bg-blue-600 text-white select-none">
								{getInitials(currentFullName)}
							</div>
							<div>
								<div className="flex items-center gap-2">
									<h3 className="text-xl font-bold text-slate-800">
										{currentFullName}
									</h3>
									<span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusMeta.chipClass}`}>
										{statusMeta.label}
									</span>
								</div>
								<p className="text-sm text-slate-500 font-medium">
									{currentPosition}
								</p>
								<div className="space-y-1 mt-2">
									{currentEmail && currentEmail !== "—" && (
										<div className="flex items-center gap-2 text-xs text-slate-500">
											{currentEmail.includes("@") ? (
												<Mail size={13} className="text-slate-400 shrink-0" />
											) : (
												<Phone size={13} className="text-slate-400 shrink-0" />
											)}
											<span className="font-semibold">{currentEmail}</span>
										</div>
									)}
									{currentDepartment && currentDepartment !== "—" && (
										<div className="flex items-center gap-2 text-xs text-slate-500">
											<Building2 size={13} className="text-slate-400 shrink-0" />
											<span className="font-medium">{currentDepartment}</span>
										</div>
									)}
									{formattedJoinedAt && (
										<div className="flex items-center gap-2 text-xs text-slate-400">
											<Calendar size={13} className="text-slate-400 shrink-0" />
											<span>В системе с {formattedJoinedAt}</span>
										</div>
									)}
								</div>
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
					<div className="flex items-center gap-6">
						{(["profile", "permissions", "sessions", "history"] as const).map((t) => {
							const labels = {
								profile: "Профиль",
								permissions: "Права доступа",
								sessions: "Сессии",
								history: "История",
							};
							const isActive = tab === t;
							return (
								<button
									key={t}
									onClick={() => setTab(t)}
									className={`relative pb-3 text-sm font-semibold transition-colors cursor-pointer select-none outline-none! focus:outline-none! border border-transparent ${
										isActive ? "text-blue-600 font-bold" : "text-slate-500 hover:text-slate-700"
									}`}
								>
									<span>{labels[t]}</span>
									{isActive && (
										<motion.div
											initial={{ scaleX: 0 }}
											animate={{ scaleX: 1 }}
											className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 rounded-full origin-left"
											transition={{ type: "spring", stiffness: 380, damping: 30 }}
										/>
									)}
								</button>
							);
						})}
					</div>
				</div>

				<div className="px-6 py-6 overflow-y-auto flex-1 relative">
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
										<div className="flex flex-wrap gap-2.5 items-center">
											{selectedRoles.length === 0 && (
												<span className="text-slate-400 text-xs font-semibold italic mr-2 select-none">
													Роли не назначены
												</span>
											)}
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

									<div className="border border-slate-100 rounded-2xl p-5 space-y-3">
										<h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
											Уровни доступа
										</h4>
										{relevantPermissions.length > 0 ? (
											<>
												<div className="grid grid-cols-2 gap-x-6 gap-y-1">
													{paginatedAccessLevels.map((perm) => {
														const parts = perm.split(".");
														const mod = MODULE_TRANSLATIONS[parts[0]] || parts[0];
														const action = ACTION_TRANSLATIONS[parts.slice(1).join(".")] || parts.slice(1).join(".");
														const hasPermission = userPermissionsState.includes(perm);
														return (
															<div key={perm} className="flex items-center justify-between py-2 border-b border-slate-50/50">
																<span className="text-xs text-slate-600 font-semibold">
																	{mod} — {action}
																</span>
																{hasPermission ? (
																	<span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 text-[10px] font-bold select-none">
																		Да
																	</span>
																) : (
																	<span className="px-2 py-0.5 rounded bg-slate-100 text-slate-400 text-[10px] font-bold select-none">
																		Нет
																	</span>
																)}
															</div>
														);
													})}
												</div>
												{relevantPermissions.length > ACCESS_PAGE_SIZE && (
													<div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 mt-2">
														<span className="text-xs text-slate-400 font-medium mr-auto">
															{(accessPage - 1) * ACCESS_PAGE_SIZE + 1}–{Math.min(accessPage * ACCESS_PAGE_SIZE, relevantPermissions.length)} из {relevantPermissions.length} прав
														</span>
														<button
															onClick={() => setAccessPage((p) => Math.max(1, p - 1))}
															disabled={accessPage === 1}
															className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
														>
															<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
														</button>
														<span className="text-xs font-bold text-slate-600 min-w-[32px] text-center">
															{accessPage} / {Math.ceil(relevantPermissions.length / ACCESS_PAGE_SIZE)}
														</span>
														<button
															onClick={() => setAccessPage((p) => Math.min(Math.ceil(relevantPermissions.length / ACCESS_PAGE_SIZE), p + 1))}
															disabled={accessPage >= Math.ceil(relevantPermissions.length / ACCESS_PAGE_SIZE)}
															className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
														>
															<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
														</button>
													</div>
												)}
											</>
										) : (
											<div className="py-8 flex flex-col items-center justify-center gap-1 text-slate-400 select-none">
												<span className="text-xs font-semibold text-slate-550">Уровни доступа не назначены</span>
												<span className="text-[10px] font-semibold opacity-75">Назначьте роль сотруднику для автоматической активации прав</span>
											</div>
										)}
									</div>
								</div>
							</If>
							<If is={tab === "permissions"}>
								<div className="space-y-4">
									<div className="space-y-5">
										{paginatedGroupEntries.map(
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
									{Object.keys(groupedPermissions).length > PAGE_SIZE && (
										<div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 mt-2">
											<span className="text-xs text-slate-400 font-medium mr-auto">
												{(permissionsPage - 1) * PAGE_SIZE + 1}–{Math.min(permissionsPage * PAGE_SIZE, Object.keys(groupedPermissions).length)} из {Object.keys(groupedPermissions).length} модулей
											</span>
											<button
												onClick={() => setPermissionsPage((p) => Math.max(1, p - 1))}
												disabled={permissionsPage === 1}
												className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
											>
												<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
											</button>
											<span className="text-xs font-bold text-slate-600 min-w-[32px] text-center">
												{permissionsPage} / {Math.ceil(Object.keys(groupedPermissions).length / PAGE_SIZE)}
											</span>
											<button
												onClick={() => setPermissionsPage((p) => Math.min(Math.ceil(Object.keys(groupedPermissions).length / PAGE_SIZE), p + 1))}
												disabled={permissionsPage >= Math.ceil(Object.keys(groupedPermissions).length / PAGE_SIZE)}
												className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
											>
												<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
											</button>
										</div>
									)}
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
					<If is={tab === "profile"}>
						<button
							onClick={handleSave}
							disabled={updateRolesM.isPending}
							className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60 transition-colors"
						>
							<Check size={16} />
							<span>Сохранить изменения</span>
						</button>
					</If>
					<If is={tab === "permissions"}>
						<button
							onClick={handleSavePermissions}
							disabled={updatePermissionsM.isPending}
							className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60 transition-colors"
						>
							<Check size={16} />
							<span>Сохранить права</span>
						</button>
					</If>
				</div>
			</div>
		</div>
		</ConfigProvider>
	);
};

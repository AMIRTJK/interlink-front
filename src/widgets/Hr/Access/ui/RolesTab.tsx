import { useState, useMemo, useEffect } from "react";
import { Search, Plus, LayoutGrid, List, ShieldPlus } from "lucide-react";
import { Input, Modal, Pagination } from "antd";

import { useGetQuery, useMutationQuery } from "@shared/lib";
import { ApiRoutes, _axios } from "@shared/api";
import { EmployeeFormModal } from "@features/Hr";
import type { IAdminUser } from "@entities/hr";
import { normalizeAccessUsers } from "../lib";
import { RoleCard } from "./RoleCard";
import { RoleListTable } from "./RoleListTable";
import { RoleUsersTable } from "./RoleUsersTable";
import { RolePermissionsSidebar } from "./RolePermissionsSidebar";
import { UserPermissionsSidebar } from "./UserPermissionsSidebar";
import { CreateRoleModal } from "./CreateRoleModal";
import { CreateUiPermissionModal } from "./CreateUiPermissionModal";
import { IAccessUser } from "../model";

export const RolesTab = () => {
	const [selectedRole, setSelectedRole] = useState<{
		id: number;
		name: string;
		permissions?: string[] | { name: string }[];
	} | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [isCreateUiPermOpen, setIsCreateUiPermOpen] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [rolesPage, setRolesPage] = useState(1);
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [viewingUser, setViewingUser] = useState<IAccessUser | null>(null);
	const [editingUser, setEditingUser] = useState<IAdminUser | null>(null);
	const [isFormOpen, setIsFormOpen] = useState(false);

	const { data: rolesData } = useGetQuery({
		url: ApiRoutes.GET_ROLES,
		useToken: true,
		options: {
			refetchOnWindowFocus: false,
			staleTime: 30 * 60 * 1000,
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

	const rolesList = useMemo(() => {
		const raw = (rolesData?.data?.data ||
			rolesData?.data ||
			rolesData ||
			[]) as {
			id: number;
			name: string;
			permissions?: string[] | { name: string }[];
		}[];
		return Array.isArray(raw) ? raw : [];
	}, [rolesData]);

	/**
	 * Реальный счётчик «пользователей на роль» — берём готовый total из
	 * пагинации ответа GET /admin/users?role=X (бэкенд честно фильтрует и
	 * считает сам), а не собираем вручную по всем пользователям: per_page=1000
	 * не гарантирует, что бэкенд отдаст реально ВСЕХ пользователей за один
	 * запрос — он может просто урезать per_page до дефолтного значения.
	 */
	const [roleUserCounts, setRoleUserCounts] = useState<Record<string, number>>({});

	useEffect(() => {
		if (rolesList.length === 0) return;
		let cancelled = false;

		Promise.all(
			rolesList.map((r) =>
				_axios
					.get(ApiRoutes.GET_USERS, { params: { role: r.name, per_page: 1 } })
					.then((res) => {
						const body = res.data;
						const total = body?.data?.total ?? body?.total ?? 0;
						return [r.name, total] as const;
					})
					.catch(() => [r.name, 0] as const),
			),
		).then((results) => {
			if (!cancelled) {
				setRoleUserCounts(Object.fromEntries(results));
			}
		});

		return () => {
			cancelled = true;
		};
	}, [rolesList]);

	const paginatedRoles = useMemo(() => {
		const start = (rolesPage - 1) * 6;
		return rolesList.slice(start, start + 6);
	}, [rolesList, rolesPage]);

	useEffect(() => {
		setRolesPage(1);
	}, [rolesList.length]);

	useEffect(() => {
		if (rolesList.length > 0 && !selectedRole) {
			setSelectedRole(rolesList[0]);
		} else if (rolesList.length > 0 && selectedRole) {
			const updated = rolesList.find((r) => r.id === selectedRole.id);
			if (updated) {
				setSelectedRole(updated);
			}
		}
	}, [rolesList]);

	useEffect(() => {
		setCurrentPage(1);
	}, [selectedRole?.id, searchQuery]);

	const { data: usersData, isLoading: usersLoading } = useGetQuery({
		url: ApiRoutes.GET_USERS,
		useToken: true,
		params: useMemo(() => {
			const p: Record<string, any> = {};
			if (selectedRole) {
				p.role = selectedRole.name;
			}
			if (searchQuery) {
				p.search = searchQuery;
			}
			p.page = currentPage;
			p.per_page = 15;
			return p;
		}, [selectedRole, searchQuery, currentPage]),
		options: {
			enabled: !!selectedRole,
			keepPreviousData: true,
			refetchOnWindowFocus: false,
			staleTime: 5 * 60 * 1000,
		},
	});

	const rawUsers = useMemo(() => {
		const raw = (usersData?.data?.data ||
			usersData?.data ||
			usersData ||
			[]) as any[];
		return raw;
	}, [usersData]);

	const normalizedUsers = useMemo(() => {
		return normalizeAccessUsers(rawUsers);
	}, [rawUsers]);

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

	const deleteRoleM = useMutationQuery({
		url: (d: { id: number }) =>
			ApiRoutes.DELETE_ROLE.replace(":id", String(d.id)),
		method: "DELETE",
		messages: {
			success: "Роль успешно удалена",
			invalidate: [ApiRoutes.GET_ROLES],
		},
	});

	const deleteUserM = useMutationQuery({
		url: (d: { id: number }) =>
			ApiRoutes.DELETE_USER.replace(":id", String(d.id)),
		method: "DELETE",
		messages: {
			success: "Пользователь успешно удален",
			invalidate: [ApiRoutes.GET_USERS],
		},
	});

	const handleOpenEditUser = (user: IAccessUser) => {
		setEditingUser(user.raw);
		setIsFormOpen(true);
	};

	const handleDeleteUser = (id: number) => {
		deleteUserM.mutate({ id });
	};

	const handleDeleteRole = (roleItem: any) => {
		Modal.confirm({
			title: "Удалить роль?",
			content: "Это действие необратимо.",
			okText: "Удалить",
			okType: "danger",
			cancelText: "Отмена",
			onOk: () => {
				deleteRoleM.mutate(
					{ id: roleItem.id },
					{
						onSuccess: () => {
							if (selectedRole?.id === roleItem.id) {
								setSelectedRole(null);
							}
						},
					},
				);
			},
		});
	};

	const totalUsers =
		usersData?.data?.total || usersData?.total || normalizedUsers.length;
	const perPage = usersData?.data?.per_page || usersData?.per_page || 15;

	const selectedRoleDisplayName = selectedRole ? selectedRole.name : "";

	return (
		<div className="flex flex-col lg:flex-row gap-6 items-start w-full!">
			<div className="flex-1 w-full! space-y-6">
				<div className="flex justify-between items-start">
					<div>
						<h2 className="text-xl font-bold text-slate-800 leading-tight">
							{"Роли и доступы"}
						</h2>
						<p className="text-xs text-slate-400 mt-1">
							{"Управление ролями пользователей СЭД"}
						</p>
					</div>
					<div className="flex items-center gap-3">
						<div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
							<button
								onClick={() => setViewMode("grid")}
								className={`p-1.5 rounded-lg transition-colors cursor-pointer select-none outline-none! ${
									viewMode === "grid"
										? "bg-white text-slate-700 shadow-sm"
										: "text-slate-400 hover:text-slate-600"
								}`}
							>
								<LayoutGrid size={15} />
							</button>
							<button
								onClick={() => setViewMode("list")}
								className={`p-1.5 rounded-lg transition-colors cursor-pointer select-none outline-none! ${
									viewMode === "list"
										? "bg-white text-slate-700 shadow-sm"
										: "text-slate-400 hover:text-slate-600"
								}`}
							>
								<List size={15} />
							</button>
						</div>
						<button
							onClick={() => setIsCreateUiPermOpen(true)}
							className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
						>
							<ShieldPlus size={14} />
							<span>{"Создать UI-право"}</span>
						</button>
						<button
							onClick={() => setIsCreateOpen(true)}
							className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
						>
							<Plus size={14} />
							<span>{"Создать роль"}</span>
						</button>
					</div>
				</div>

					{viewMode === "grid" ? (
						<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
							{paginatedRoles.map((r) => (
								<RoleCard
									key={r.id}
									role={r}
									userCount={roleUserCounts[r.name] ?? 0}
									isSelected={selectedRole?.id === r.id}
									onSelect={() => { setSelectedRole(r); setViewingUser(null); }}
									onEdit={() => { setSelectedRole(r); setViewingUser(null); }}
									onDelete={() => handleDeleteRole(r)}
								/>
							))}
						</div>
					) : (
						<div>
							<RoleListTable
								items={paginatedRoles}
								selectedRoleId={selectedRole?.id}
								onSelect={(r) => { setSelectedRole(r); setViewingUser(null); }}
								onEdit={(r) => { setSelectedRole(r); setViewingUser(null); }}
								onDelete={handleDeleteRole}
								userCounts={roleUserCounts}
							/>
						</div>
					)}

				{rolesList.length > 6 &&
					(() => {
						const totalPages = Math.ceil(rolesList.length / 6);
						const pageLimit = 5;
						const pagesList: number[] = [];
						let start = Math.max(1, rolesPage - 2);
						let end = Math.min(totalPages, start + pageLimit - 1);
						if (end - start + 1 < pageLimit) {
							start = Math.max(1, end - pageLimit + 1);
						}
						for (let i = start; i <= end; i++) {
							pagesList.push(i);
						}

						return (
							<div className="flex justify-end pt-2">
								<div className="flex items-center gap-1.5">
									<button
										onClick={() => setRolesPage(Math.max(1, rolesPage - 1))}
										disabled={rolesPage === 1}
										className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer bg-white"
									>
										<svg
											width="14"
											height="14"
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
											onClick={() => setRolesPage(p)}
											className={`w-8 h-8 flex items-center justify-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
												rolesPage === p
													? "bg-blue-600 text-white border border-blue-600 shadow-sm"
													: "bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
											}`}
										>
											{p}
										</button>
									))}
									<button
										onClick={() =>
											setRolesPage(Math.min(totalPages, rolesPage + 1))
										}
										disabled={rolesPage === totalPages}
										className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer bg-white"
									>
										<svg
											width="14"
											height="14"
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

				{selectedRole && (
					<div className="space-y-4 pt-4 border-t border-slate-100">
						<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
							<div className="space-y-1">
								<h3 className="text-[15px] font-bold text-slate-800 flex items-center gap-2 flex-wrap">
									<span>{"Пользователи с ролью:"}</span>
									<span className="text-blue-600">
										{selectedRoleDisplayName}
									</span>
								</h3>
								<div className="text-xs text-slate-400 font-semibold pl-0.5">
									{"Найдено:"} {totalUsers}
								</div>
							</div>

							<Input
								placeholder={"Поиск пользователя..."}
								prefix={<Search size={14} className="text-slate-400" />}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-72! rounded-xl! border-slate-200!"
							/>
						</div>

						<RoleUsersTable
							items={normalizedUsers}
							loading={!!usersLoading}
							total={totalUsers}
							currentPage={currentPage}
							pageSize={perPage}
							onPageChange={setCurrentPage}
							onViewAccess={setViewingUser}
							onEdit={handleOpenEditUser}
							onDelete={handleDeleteUser}
						/>
					</div>
				)}
			</div>

			{viewingUser ? (
				<div className="shrink-0! sticky top-6 w-[320px] pb-4">
					<UserPermissionsSidebar
						user={viewingUser}
						allSystemPermissions={allSystemPermissions}
						onClose={() => setViewingUser(null)}
					/>
				</div>
			) : (
				selectedRole && (
					<div className="shrink-0! sticky top-6 w-[320px] pb-4">
						<RolePermissionsSidebar
							role={selectedRole}
							allSystemPermissions={allSystemPermissions}
							onClose={() => setSelectedRole(null)}
						/>
					</div>
				)
			)}

			<CreateRoleModal
				open={isCreateOpen}
				onClose={() => setIsCreateOpen(false)}
			/>
			<CreateUiPermissionModal
				open={isCreateUiPermOpen}
				onClose={() => setIsCreateUiPermOpen(false)}
			/>

			<EmployeeFormModal
				open={isFormOpen}
				onClose={() => setIsFormOpen(false)}
				employee={editingUser}
			/>
		</div>
	);
};

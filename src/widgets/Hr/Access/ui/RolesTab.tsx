import { useState, useMemo, useEffect } from "react";
import { Search, Plus } from "lucide-react";
import { Input, Modal, Pagination } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { useGetQuery, useMutationQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { normalizeAccessUsers } from "../lib";
import { RoleCard } from "./RoleCard";
import { RoleUsersTable } from "./RoleUsersTable";
import { RolePermissionsSidebar } from "./RolePermissionsSidebar";
import { CreateRoleModal } from "./CreateRoleModal";
import { IAccessUser } from "../model";




export const RolesTab = () => {
	const [selectedRole, setSelectedRole] = useState<{
		id: number;
		name: string;
		permissions?: string[] | { name: string }[];
	} | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [rolesPage, setRolesPage] = useState(1);

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

	const totalUsers = usersData?.data?.total || usersData?.total || normalizedUsers.length;
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
					<button
						onClick={() => setIsCreateOpen(true)}
						className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
					>
						<Plus size={14} />
						<span>{"Создать роль"}</span>
					</button>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{paginatedRoles.map((r) => (
						<RoleCard
							key={r.id}
							role={r}
							userCount={10}
							isSelected={selectedRole?.id === r.id}
							onSelect={() => setSelectedRole(r)}
							onEdit={() => setSelectedRole(r)}
							onDelete={() => handleDeleteRole(r)}
						/>
					))}
				</div>

				{rolesList.length > 6 && (
					<div className="flex justify-end pt-2">
						<Pagination
							current={rolesPage}
							pageSize={6}
							total={rolesList.length}
							onChange={setRolesPage}
							showSizeChanger={false}
							size="small"
						/>
					</div>
				)}

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
							onViewAccess={() => {}}
							onEdit={() => {}}
							onDelete={() => {}}
						/>
					</div>
				)}
			</div>

			<AnimatePresence>
				{selectedRole && (
					<motion.div
						initial={{ opacity: 0, width: 0 }}
						animate={{ opacity: 1, width: 320 }}
						exit={{ opacity: 0, width: 0 }}
						transition={{ duration: 0.2, ease: "easeOut" }}
						className="shrink-0! sticky top-6 overflow-hidden"
					>
						<div className="w-[320px] pb-4">
							<RolePermissionsSidebar
								role={selectedRole}
								allSystemPermissions={allSystemPermissions}
								onClose={() => setSelectedRole(null)}
							/>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			<CreateRoleModal
				open={isCreateOpen}
				onClose={() => setIsCreateOpen(false)}
			/>
		</div>
	);
};

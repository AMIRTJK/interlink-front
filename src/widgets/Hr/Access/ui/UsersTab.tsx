import React, { useState, useMemo } from "react";
import { Search, Plus } from "lucide-react";
import { Select } from "antd";
import { AnimatePresence, motion } from "framer-motion";
import { useGetQuery, useMutationQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { If } from "@shared/ui";
import { EmployeeFormModal } from "@features/Hr";
import type { IAdminUser } from "@entities/hr";
import { IAccessUser, IUserAccessFilters } from "../model";
import { normalizeAccessUsers } from "../lib";
import { UsersTable } from "./UsersTable";
import { UserProfileModal } from "./UserProfileModal";

const ROLE_CHIP_STYLE_MAP: Record<
	string,
	{ border: string; bg: string; text: string; dot: string }
> = {
	super_admin: {
		border: "border-blue-400!",
		bg: "bg-blue-50/50!",
		text: "text-blue-600!",
		dot: "bg-blue-500!",
	},
	recipient: {
		border: "border-emerald-400!",
		bg: "bg-emerald-50/50!",
		text: "text-emerald-600!",
		dot: "bg-emerald-500!",
	},
	signer: {
		border: "border-orange-400!",
		bg: "bg-orange-50/50!",
		text: "text-orange-600!",
		dot: "bg-orange-500!",
	},
	approvaler: {
		border: "border-indigo-400!",
		bg: "bg-indigo-50/50!",
		text: "text-indigo-600!",
		dot: "bg-indigo-500!",
	},
	controller: {
		border: "border-purple-400!",
		bg: "bg-purple-50/50!",
		text: "text-purple-600!",
		dot: "bg-purple-500!",
	},
	observer: {
		border: "border-slate-300!",
		bg: "bg-slate-50!",
		text: "text-slate-500!",
		dot: "bg-slate-400!",
	},
};

export const UsersTab = () => {
	const [filters, setFilters] = useState<IUserAccessFilters>({
		search: "",
		role: "all",
		department: "all",
		status: "all",
	});

	const [selectedQuickRole, setSelectedQuickRole] = useState<string>("all");
	const [viewingUser, setViewingUser] = useState<IAccessUser | null>(null);
	const [editingUser, setEditingUser] = useState<IAdminUser | null>(null);
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const perPage = 10;

	const queryParams = useMemo(() => {
		const p: Record<string, string> = {};
		if (filters.search) {
			p.search = filters.search;
		}
		const activeRole =
			selectedQuickRole !== "all" ? selectedQuickRole : filters.role;
		if (activeRole !== "all") {
			p.role = activeRole;
		}
		if (filters.department !== "all") {
			p.department = filters.department;
		}
		if (filters.status !== "all") {
			p.status = filters.status;
		}
		p.page = String(currentPage);
		p.per_page = String(perPage);
		return p;
	}, [filters, selectedQuickRole, currentPage]);

	const { data: usersData, isLoading: usersLoading } = useGetQuery({
		url: ApiRoutes.GET_USERS,
		useToken: true,
		params: queryParams,
		options: {
			keepPreviousData: true,
			refetchOnWindowFocus: false,
			staleTime: 5 * 60 * 1000,
		},
	});

	const { data: rolesData } = useGetQuery({
		url: ApiRoutes.GET_ROLES,
		useToken: true,
		options: {
			refetchOnWindowFocus: false,
			refetchOnMount: false,
			staleTime: 30 * 60 * 1000,
		},
	});

	const { data: deptsData } = useGetQuery({
		url: ApiRoutes.GET_DEPARTMENTS,
		useToken: true,
		options: {
			refetchOnWindowFocus: false,
			refetchOnMount: false,
			staleTime: 30 * 60 * 1000,
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

	const rawUsers = useMemo(() => {
		const raw = (usersData?.data?.data ||
			usersData?.data ||
			usersData ||
			[]) as IAdminUser[];
		return raw;
	}, [usersData]);

	const totalUsers = useMemo(() => {
		return usersData?.data?.total ?? usersData?.total ?? rawUsers.length;
	}, [usersData, rawUsers.length]);

	const allUsers = useMemo(() => {
		return normalizeAccessUsers(rawUsers);
	}, [rawUsers]);

	const roles = useMemo(() => {
		const raw = (rolesData?.data?.data ||
			rolesData?.data ||
			rolesData ||
			[]) as { id: number; name: string }[];
		return raw.map((r) => r.name);
	}, [rolesData]);

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

	const departments = useMemo(() => {
		const raw = (deptsData?.data?.data ||
			deptsData?.data ||
			deptsData ||
			[]) as { id: number; name: string }[];
		return raw.map((d) => d.name);
	}, [deptsData]);

	const counters = useMemo(() => {
		const counts = { all: 0, active: 0, inactive: 0, blocked: 0 };
		allUsers.forEach((u) => {
			counts.all++;
			if (u.status === "active") counts.active++;
			else if (u.status === "inactive") counts.inactive++;
			else if (u.status === "blocked") counts.blocked++;
		});
		return counts;
	}, [allUsers]);

	const filteredUsers = useMemo(() => {
		return allUsers.filter((u) => {
			if (filters.search) {
				const query = filters.search.toLowerCase();
				const matchesName = u.fullName.toLowerCase().includes(query);
				const matchesEmail = u.email.toLowerCase().includes(query);
				if (!matchesName && !matchesEmail) return false;
			}
			if (filters.status !== "all" && u.status !== filters.status) {
				return false;
			}
			if (filters.department !== "all" && u.department !== filters.department) {
				return false;
			}
			if (filters.role !== "all" && !u.roles.includes(filters.role)) {
				return false;
			}
			if (selectedQuickRole !== "all" && !u.roles.includes(selectedQuickRole)) {
				return false;
			}
			return true;
		});
	}, [allUsers, filters, selectedQuickRole]);

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	const handleFilterChange = (key: keyof IUserAccessFilters, value: string) => {
		setFilters((prev) => ({ ...prev, [key]: value }));
		setCurrentPage(1);
	};

	const handleQuickRoleChange = (role: string) => {
		setSelectedQuickRole(role);
		setCurrentPage(1);
	};

	const handleOpenCreate = () => {
		setEditingUser(null);
		setIsFormOpen(true);
	};

	const handleOpenEdit = (user: IAccessUser) => {
		setEditingUser(user.raw);
		setIsFormOpen(true);
	};

	const handleDeleteUser = (id: number) => {
		deleteUserM.mutate({ id });
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold text-slate-800">Пользователи</h2>
					<p className="text-sm text-slate-400 font-medium">
						Управление сотрудниками и доступами
					</p>
				</div>
				<button
					onClick={handleOpenCreate}
					className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-sm"
				>
					<Plus size={16} />
					<span>Добавить</span>
				</button>
			</div>

			<div className="flex items-center gap-2 flex-wrap">
				<button
					onClick={() => setFilters((prev) => ({ ...prev, status: "all" }))}
					className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5 ${
						filters.status === "all"
							? "bg-slate-200 text-slate-800"
							: "bg-slate-50 text-slate-500 hover:bg-slate-100"
					}`}
				>
					<span>Всего</span>
					<span className="font-bold">{counters.all}</span>
				</button>
				<button
					onClick={() => setFilters((prev) => ({ ...prev, status: "active" }))}
					className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5 ${
						filters.status === "active"
							? "bg-emerald-100 text-emerald-800"
							: "bg-slate-50 text-slate-500 hover:bg-slate-100"
					}`}
				>
					<span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
					<span>Активные</span>
					<span className="font-bold">{counters.active}</span>
				</button>
				<button
					onClick={() =>
						setFilters((prev) => ({ ...prev, status: "inactive" }))
					}
					className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5 ${
						filters.status === "inactive"
							? "bg-slate-200 text-slate-700"
							: "bg-slate-50 text-slate-500 hover:bg-slate-100"
					}`}
				>
					<span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
					<span>Неактивные</span>
					<span className="font-bold">{counters.inactive}</span>
				</button>
				<button
					onClick={() => setFilters((prev) => ({ ...prev, status: "blocked" }))}
					className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5 ${
						filters.status === "blocked"
							? "bg-rose-100 text-rose-800"
							: "bg-slate-50 text-slate-500 hover:bg-slate-100"
					}`}
				>
					<span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
					<span>Заблокированные</span>
					<span className="font-bold">{counters.blocked}</span>
				</button>
			</div>

			<div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center gap-3 flex-wrap">
				<div className="relative flex-1 min-w-[240px]">
					<Search
						size={18}
						className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
					/>
					<input
						type="text"
						value={filters.search}
						onChange={(e) =>
							setFilters((prev) => ({ ...prev, search: e.target.value }))
						}
						placeholder="Поиск сотрудника..."
						className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
					/>
				</div>
				<Select
					value={filters.role}
					onChange={(role) => handleFilterChange("role", role)}
					className="w-48 h-[38px] rounded-xl text-sm"
					placeholder="Все роли"
					options={[
						{ value: "all", label: "Все роли" },
						...roles.map((r) => ({ value: r, label: r })),
					]}
				/>
				<Select
					value={filters.department}
					onChange={(department) =>
						handleFilterChange("department", department)
					}
					className="w-48 h-[38px] rounded-xl text-sm"
					placeholder="Все отделы"
					options={[
						{ value: "all", label: "Все отделы" },
						...departments.map((d) => ({ value: d, label: d })),
					]}
				/>
				<Select
					value={filters.status}
					onChange={(status) => handleFilterChange("status", status)}
					className="w-40 h-[38px] rounded-xl text-sm"
					placeholder="Статус"
					options={[
						{ value: "all", label: "Статус" },
						{ value: "active", label: "Активен" },
						{ value: "inactive", label: "Неактивен" },
						{ value: "blocked", label: "Заблокирован" },
					]}
				/>
			</div>

			<div className="flex items-center gap-1.5 flex-wrap overflow-x-auto pb-1 relative z-1">
				<button
					onClick={() => handleQuickRoleChange("all")}
					className={`relative px-3 py-1.5 border rounded-xl text-xs font-semibold transition-colors duration-200 cursor-pointer select-none outline-none! ${
						selectedQuickRole === "all"
							? "border-blue-600 text-blue-600"
							: "border-slate-200 text-slate-500 hover:bg-slate-50"
					}`}
				>
					{selectedQuickRole === "all" && (
						<motion.div
							layoutId="activeQuickRolePill"
							className="absolute inset-0 bg-blue-50/50 -z-10 rounded-xl"
							transition={{ type: "spring", stiffness: 380, damping: 30 }}
						/>
					)}
					<span className="relative z-10">Все</span>
				</button>
				{roles.map((role) => {
					const isSelected = selectedQuickRole === role;
					const activeStyle = ROLE_CHIP_STYLE_MAP[role] || {
						border: "border-blue-400!",
						bg: "bg-blue-50/50!",
						text: "text-blue-600!",
						dot: "bg-blue-500!",
					};

					return (
						<button
							key={role}
							onClick={() => handleQuickRoleChange(role)}
							className={`relative px-3 py-1.5 border rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors duration-200 cursor-pointer select-none outline-none! ${
								isSelected
									? `${activeStyle.border} ${activeStyle.text}`
									: "border-slate-200 text-slate-500 hover:bg-slate-50"
							}`}
						>
							{isSelected && (
								<motion.div
									layoutId="activeQuickRolePill"
									className={`absolute inset-0 -z-10 rounded-xl ${activeStyle.bg}`}
									transition={{ type: "spring", stiffness: 380, damping: 30 }}
								/>
							)}
							<span
								className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
									isSelected
										? `${activeStyle.dot} opacity-100 scale-100`
										: "bg-slate-400 opacity-0 scale-50"
								}`}
							/>
							<span className="relative z-10">{role}</span>
						</button>
					);
				})}
			</div>

			<UsersTable
				items={filteredUsers}
				loading={Boolean(usersLoading)}
				onViewAccess={setViewingUser}
				onEdit={handleOpenEdit}
				onDelete={handleDeleteUser}
			/>

			{totalUsers > perPage && (
				<div className="flex items-center justify-between px-1 pt-2">
					<span className="text-xs text-slate-400 font-medium">
						Показано {(currentPage - 1) * perPage + 1}–
						{Math.min(currentPage * perPage, totalUsers)} из {totalUsers}{" "}
						сотрудников
					</span>
					<div className="flex items-center gap-2">
						<button
							onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
							disabled={currentPage === 1}
							className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
						<span className="text-xs font-bold text-slate-600 min-w-[40px] text-center">
							{currentPage} / {Math.ceil(totalUsers / perPage)}
						</span>
						<button
							onClick={() =>
								handlePageChange(
									Math.min(Math.ceil(totalUsers / perPage), currentPage + 1),
								)
							}
							disabled={currentPage >= Math.ceil(totalUsers / perPage)}
							className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
			)}

			<AnimatePresence>
				<If is={Boolean(viewingUser)}>
					{viewingUser && (
						<UserProfileModal
							user={viewingUser}
							onClose={() => setViewingUser(null)}
							onEdit={handleOpenEdit}
							onDelete={handleDeleteUser}
							allRoles={rolesList}
						/>
					)}
				</If>
			</AnimatePresence>

			<EmployeeFormModal
				open={isFormOpen}
				onClose={() => setIsFormOpen(false)}
				employee={editingUser}
			/>
		</div>
	);
};


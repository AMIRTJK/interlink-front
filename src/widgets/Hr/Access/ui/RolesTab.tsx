import { useState, useMemo, useEffect } from "react";
import { Search, Plus } from "lucide-react";
import { Input, Modal } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { useGetQuery, useMutationQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { normalizeAccessUsers } from "../lib";
import { RoleCard } from "./RoleCard";
import { RoleUsersTable } from "./RoleUsersTable";
import { RolePermissionsSidebar } from "./RolePermissionsSidebar";
import { CreateRoleModal } from "./CreateRoleModal";
import { IAccessUser } from "../model";


const ROLE_DISPLAY_NAMES: Record<string, string> = {
	super_admin: "\u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440 \u0441\u0438\u0441\u0442\u0435\u043c\u044b",
	recipient: "\u0414\u0435\u043b\u043e\u043f\u0440\u043e\u0438\u0437\u0432\u043e\u0434\u0438\u0442\u0435\u043b\u044c",
	signer: "\u0420\u0443\u043a\u043e\u0432\u043e\u0434\u0438\u0442\u0435\u043b\u044c",
	approvaler: "\u0418\u0441\u043f\u043e\u043b\u043d\u0438\u0442\u0435\u043b\u044c",
	controller: "\u041a\u043e\u043d\u0442\u0440\u043e\u043b\u0451\u0440",
	observer: "\u041d\u0430\u0431\u043b\u044e\u0434\u0430\u0442\u0435\u043b\u044c",
};

export const RolesTab = () => {
	const [selectedRole, setSelectedRole] = useState<{
		id: number;
		name: string;
		permissions?: string[] | { name: string }[];
	} | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [isCreateOpen, setIsCreateOpen] = useState(false);

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

	const { data: usersData, isLoading: usersLoading } = useGetQuery({
		url: ApiRoutes.GET_USERS,
		useToken: true,
		params: useMemo(() => {
			const p: Record<string, string> = {};
			if (selectedRole) {
				p.role = selectedRole.name;
			}
			if (searchQuery) {
				p.search = searchQuery;
			}
			return p;
		}, [selectedRole, searchQuery]),
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
			success: "\u0420\u043e\u043b\u044c \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0443\u0434\u0430\u043b\u0435\u043d\u0430",
			invalidate: [ApiRoutes.GET_ROLES],
		},
	});

	const handleDeleteRole = (roleItem: any) => {
		Modal.confirm({
			title: "\u0423\u0434\u0430\u043b\u0438\u0442\u044c \u0440\u043e\u043b\u044c?",
			content: "\u042d\u0442\u043e \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435 \u043d\u0435\u043e\u0431\u0440\u0430\u0442\u0438\u043c\u043e.",
			okText: "\u0423\u0434\u0430\u043b\u0438\u0442\u044c",
			okType: "danger",
			cancelText: "\u041e\u0442\u043c\u0435\u043d\u0430",
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

	const selectedRoleDisplayName = selectedRole
		? ROLE_DISPLAY_NAMES[selectedRole.name] || selectedRole.name
		: "";

	return (
		<div className="flex flex-col lg:flex-row gap-6 items-start w-full!">
			<div className="flex-1 w-full! space-y-6">
				<div className="flex justify-between items-start">
					<div>
						<h2 className="text-xl font-bold text-slate-800 leading-tight">
							{"\u0420\u043e\u043b\u0438 \u0438 \u0434\u043e\u0441\u0442\u0443\u043f\u044b"}
						</h2>
						<p className="text-xs text-slate-400 mt-1">
							{"\u0423\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0438\u0435 \u0440\u043e\u043b\u044f\u043c\u0438 \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u0435\u0439 \u0421\u042d\u0414"}
						</p>
					</div>
					<button
						onClick={() => setIsCreateOpen(true)}
						className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
					>
						<Plus size={14} />
						<span>{"+ \u0421\u043e\u0437\u0434\u0430\u0442\u044c \u0440\u043e\u043b\u044c"}</span>
					</button>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{rolesList.map((r) => (
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

				{selectedRole && (
					<div className="space-y-4 pt-4 border-t border-slate-100">
						<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
							<div className="flex items-center gap-3">
								<h3 className="text-[15px] font-bold text-slate-800 flex items-center gap-2 flex-wrap">
									<span>{"\u041f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u0438 \u0441 \u0440\u043e\u043b\u044c\u044e:"}</span>
									<span className="text-blue-600">
										{selectedRoleDisplayName}
									</span>
								</h3>
								<span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 whitespace-nowrap">
									{"\u041d\u0430\u0439\u0434\u0435\u043d\u043e:"} {normalizedUsers.length}
								</span>
							</div>

							<Input
								placeholder={"\u041f\u043e\u0438\u0441\u043a \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044f..."}
								prefix={<Search size={14} className="text-slate-400" />}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-72! rounded-xl! border-slate-200!"
							/>
						</div>

						<RoleUsersTable
							items={normalizedUsers}
							loading={!!usersLoading}
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

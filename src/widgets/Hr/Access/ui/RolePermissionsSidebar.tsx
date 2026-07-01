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

const ROLE_DISPLAY_NAMES: Record<string, string> = {
	super_admin: "\u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440 \u0441\u0438\u0441\u0442\u0435\u043c\u044b",
	recipient: "\u0414\u0435\u043b\u043e\u043f\u0440\u043e\u0438\u0437\u0432\u043e\u0434\u0438\u0442\u0435\u043b\u044c",
	signer: "\u0420\u0443\u043a\u043e\u0432\u043e\u0434\u0438\u0442\u0435\u043b\u044c",
	approvaler: "\u0418\u0441\u043f\u043e\u043b\u043d\u0438\u0442\u0435\u043b\u044c",
	controller: "\u041a\u043e\u043d\u0442\u0440\u043e\u043b\u0451\u0440",
	observer: "\u041d\u0430\u0431\u043b\u044e\u0434\u0430\u0442\u0435\u043b\u044c",
};

const MODULE_TRANSLATIONS: Record<string, string> = {
	profile: "\u041b\u0438\u0447\u043d\u044b\u0439 \u043a\u0430\u0431\u0438\u043d\u0435\u0442",
	users: "\u041f\u0435\u0440\u0441\u043e\u043d\u0430\u043b",
	roles: "\u0420\u043e\u043b\u0438",
	permissions: "\u041f\u0440\u0430\u0432\u0430 \u0434\u043e\u0441\u0442\u0443\u043f\u0430",
	organizations: "\u041e\u0440\u0433\u0430\u043d\u0438\u0437\u0430\u0446\u0438\u0438",
	departments: "\u041e\u0442\u0434\u0435\u043b\u044b",
	tasks: "\u0427\u0430\u0442 / \u0417\u0430\u0434\u0430\u0447\u0438",
	events: "\u0421\u043e\u0431\u044b\u0442\u0438\u044f",
	correspondence: "\u041a\u043e\u0440\u0440\u0435\u0441\u043f\u043e\u043d\u0434\u0435\u043d\u0446\u0438\u044f",
	internal_correspondence: "\u0412\u043d\u0443\u0442\u0440\u0435\u043d\u043d\u044f\u044f \u043a\u043e\u0440\u0440\u0435\u0441\u043f\u043e\u043d\u0434\u0435\u043d\u0446\u0438\u044f",
	signatures: "\u041f\u043e\u0434\u043f\u0438\u0441\u0438",
	analytics: "\u0410\u043d\u0430\u043b\u0438\u0442\u0438\u043a\u0430",
	approvals: "\u0421\u043e\u0433\u043b\u0430\u0441\u043e\u0432\u0430\u043d\u0438\u044f",
	system: "\u0421\u0438\u0441\u0442\u0435\u043c\u043d\u044b\u0435 \u0444\u0443\u043d\u043a\u0446\u0438\u0438",
};

const ACTION_TRANSLATIONS: Record<string, string> = {
	view: "\u041f\u0440\u043e\u0441\u043c\u043e\u0442\u0440",
	create: "\u0421\u043e\u0437\u0434\u0430\u043d\u0438\u0435",
	update: "\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u0435",
	delete: "\u0423\u0434\u0430\u043b\u0435\u043d\u0438\u0435",
	manage_ui: "\u0423\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0438\u0435 UI",
	register: "\u0420\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044f",
	assign: "\u041d\u0430\u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435",
	"assignment.update_status": "\u0418\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u0435 \u0441\u0442\u0430\u0442\u0443\u0441\u0430",
	view_all: "\u041f\u0440\u043e\u0441\u043c\u043e\u0442\u0440 \u0432\u0441\u0435\u0445",
	update_all: "\u041e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u0438\u0435 \u0432\u0441\u0435\u0445",
	"assignment.update_any": "\u041e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u0438\u0435 \u043b\u044e\u0431\u043e\u0433\u043e",
	edit_own: "\u0421\u043e\u0431\u0441\u0442\u0432\u0435\u043d\u043d\u043e\u0435",
	"folder.view": "\u041f\u0440\u043e\u0441\u043c\u043e\u0442\u0440 \u043f\u0430\u043f\u043e\u043a",
	"folder.manage": "\u0423\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0438\u0435 \u043f\u0430\u043f\u043e\u043a",
	sign: "\u041f\u043e\u0434\u043f\u0438\u0441\u0430\u043d\u0438\u0435",
	reject: "\u041e\u0442\u043a\u043b\u043e\u043d\u0435\u043d\u0438\u0435",
	export: "\u042d\u043a\u0441\u043f\u043e\u0440\u0442",
	"logs.view": "\u041f\u0440\u043e\u0441\u043c\u043e\u0442\u0440 \u043b\u043e\u0433\u043e\u0432",
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
			success: "\u041f\u0440\u0430\u0432\u0430 \u0440\u043e\u043b\u0438 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u044b",
			invalidate: [ApiRoutes.GET_ROLES],
		},
	});

	const deleteRoleM = useMutationQuery({
		url: () =>
			role ? ApiRoutes.DELETE_ROLE.replace(":id", String(role.id)) : "",
		method: "DELETE",
		messages: {
			success: "\u0420\u043e\u043b\u044c \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0443\u0434\u0430\u043b\u0435\u043d\u0430",
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
			title: "\u0423\u0434\u0430\u043b\u0438\u0442\u044c \u0440\u043e\u043b\u044c?",
			content: "\u042d\u0442\u043e \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435 \u043d\u0435\u043e\u0431\u0440\u0430\u0442\u0438\u043c\u043e.",
			okText: "\u0423\u0434\u0430\u043b\u0438\u0442\u044c",
			okType: "danger",
			cancelText: "\u041e\u0442\u043c\u0435\u043d\u0430",
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

	const displayName = ROLE_DISPLAY_NAMES[role.name] || role.name;
	const initials = displayName
		.split(" ")
		.map((n) => n[0])
		.filter(Boolean)
		.slice(0, 2)
		.join("")
		.toUpperCase();

	return (
		<div className="w-[320px] bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col h-[750px]! justify-between relative overflow-hidden">
			<div className="p-5 border-b border-slate-50 flex items-start justify-between">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold bg-emerald-50 text-emerald-600">
						{initials || "\u0420\u0414"}
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
					{"\u041f\u0420\u0410\u0412\u0410 \u0414\u041e\u0421\u0422\u0423\u041f\u0410"}
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
					<span>{"\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c"}</span>
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

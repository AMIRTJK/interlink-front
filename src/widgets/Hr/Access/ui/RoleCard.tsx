import { useMemo } from "react";
import { PERMISSION_TRANSLATIONS } from "../../../../features/Hr/model";

interface IProps {
	role: {
		id: number;
		name: string;
		permissions?: string[] | { name: string }[];
	};
	userCount: number;
	isSelected: boolean;
	onSelect: () => void;
	onEdit: () => void;
	onDelete: () => void;
}

const ROLE_DISPLAY_NAMES: Record<string, string> = {
	super_admin: "\u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440 \u0441\u0438\u0441\u0442\u0435\u043c\u044b",
	recipient: "\u0414\u0435\u043b\u043e\u043f\u0440\u043e\u0438\u0437\u0432\u043e\u0434\u0438\u0442\u0435\u043b\u044c",
	signer: "\u0420\u0443\u043a\u043e\u0432\u043e\u0434\u0438\u0442\u0435\u043b\u044c",
	approvaler: "\u0418\u0441\u043f\u043e\u043b\u043d\u0438\u0442\u0435\u043b\u044c",
	controller: "\u041a\u043e\u043d\u0442\u0440\u043e\u043b\u0451\u0440",
	observer: "\u041d\u0430\u0431\u043b\u044e\u0434\u0430\u0442\u0435\u043b\u044c",
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
	super_admin: "\u041f\u043e\u043b\u043d\u044b\u0439 \u0434\u043e\u0441\u0442\u0443\u043f \u043a\u043e \u0432\u0441\u0435\u043c \u043c\u043e\u0434\u0443\u043b\u044f\u043c \u0441\u0438\u0441\u0442\u0435\u043c\u044b",
	recipient: "\u0420\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044f \u0438 \u043e\u0431\u0440\u0430\u0431\u043e\u0442\u043a\u0430 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u043e\u0432",
	signer: "\u041f\u0440\u043e\u0441\u043c\u043e\u0442\u0440, \u043f\u043e\u0434\u043f\u0438\u0441\u0430\u043d\u0438\u0435 \u0438 \u0443\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0438\u0435 \u043f\u043e\u0440\u0443\u0447\u0435\u043d\u0438\u044f\u043c\u0438",
	approvaler: "\u0418\u0441\u043f\u043e\u043b\u043d\u0435\u043d\u0438\u0435 \u043f\u043e\u0440\u0443\u0447\u0435\u043d\u0438\u0439 \u0438 \u0440\u0430\u0431\u043e\u0442\u0430 \u0441 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u043e\u043c",
	controller: "\u041c\u043e\u043d\u0438\u0442\u043e\u0440\u0438\u043d\u0433 \u0438\u0441\u043f\u043e\u043b\u043d\u0435\u043d\u0438\u044f \u0438 \u043a\u043e\u043d\u0442\u0440\u043e\u043b\u044c",
	observer: "\u0422\u043e\u043b\u044c\u043a\u043e \u043f\u0440\u043e\u0441\u043c\u043e\u0442\u0440 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u043e\u0432 \u0438 \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b\u043e\u0432",
};

const ROLE_COLOR_CLASSES: Record<string, { border: string; dot: string; text: string; bg: string }> = {
	super_admin: { border: "border-l-blue-500!", dot: "bg-blue-500!", text: "text-blue-600!", bg: "bg-blue-50/20!" },
	recipient: { border: "border-l-emerald-500!", dot: "bg-emerald-500!", text: "text-emerald-600!", bg: "bg-emerald-50/20!" },
	signer: { border: "border-l-orange-500!", dot: "bg-orange-500!", text: "text-orange-600!", bg: "bg-orange-50/20!" },
	approvaler: { border: "border-l-indigo-500!", dot: "bg-indigo-500!", text: "text-indigo-600!", bg: "bg-indigo-50/20!" },
	controller: { border: "border-l-purple-500!", dot: "bg-purple-500!", text: "text-purple-600!", bg: "bg-purple-50/20!" },
	observer: { border: "border-l-slate-400!", dot: "bg-slate-400!", text: "text-slate-500!", bg: "bg-slate-50/20!" },
};

export const RoleCard = ({
	role,
	userCount,
	isSelected,
	onSelect,
	onEdit,
	onDelete,
}: IProps) => {
	const displayName = ROLE_DISPLAY_NAMES[role.name] || role.name;
	const description = ROLE_DESCRIPTIONS[role.name] || "\u0411\u0435\u0437 \u043e\u043f\u0438\u0441\u0430\u043d\u0438\u044f";

	const colors = useMemo(() => {
		const key = role.name.toLowerCase();
		return (
			ROLE_COLOR_CLASSES[key] || {
				border: "border-l-slate-400!",
				dot: "bg-slate-400!",
				text: "text-slate-500!",
				bg: "bg-slate-50/20!",
			}
		);
	}, [role.name]);

	const rolePermissions = useMemo(() => {
		const list: string[] = [];
		if (Array.isArray(role.permissions)) {
			role.permissions.forEach((p: any) => {
				const name = typeof p === "string" ? p : p?.name;
				if (name) {
					list.push(name);
				}
			});
		}
		return list;
	}, [role.permissions]);

	const renderedTags = useMemo(() => {
		const mapped = rolePermissions.map(
			(p) => PERMISSION_TRANSLATIONS[p] || p,
		);
		const visible = mapped.slice(0, 3);
		const remainder = mapped.length - visible.length;
		return { visible, remainder };
	}, [rolePermissions]);

	return (
		<div
			onClick={onSelect}
			className={`cursor-pointer bg-white border border-slate-100 rounded-2xl p-5 border-l-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-[180px]! ${colors.border} ${
				isSelected ? "ring-2 ring-blue-600/20 bg-blue-50/5!" : ""
			}`}
		>
			<div className="space-y-1.5">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<span className={`w-2 h-2 rounded-full ${colors.dot}`} />
						<h4 className="font-bold text-slate-800 text-[15px] leading-snug">
							{displayName}
						</h4>
					</div>
					<span className="w-6 h-6 rounded-full bg-slate-50 text-slate-500 font-bold text-xs flex items-center justify-center border border-slate-100">
						{userCount}
					</span>
				</div>
				<p className="text-xs text-slate-400 font-medium line-clamp-2 leading-relaxed">
					{description}
				</p>
			</div>

			<div className="space-y-3 pt-2">
				<div className="flex flex-wrap gap-1.5 items-center">
					{renderedTags.visible.map((tag, idx) => (
						<span
							key={idx}
							className="px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-500 text-[10px] font-semibold"
						>
							{tag.length > 12 ? tag.slice(0, 10) + "..." : tag}
						</span>
					))}
					{renderedTags.remainder > 0 && (
						<span className="px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-500 text-[10px] font-semibold">
							+{renderedTags.remainder}
						</span>
					)}
					<span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border border-current/10 ${colors.bg} ${colors.text}`}>
						{rolePermissions.length} {"\u0440\u0430\u0437\u0440."}
					</span>
				</div>

				<div className="flex items-center gap-3 text-xs font-bold pt-1 border-t border-slate-50">
					<button
						onClick={(e) => {
							e.stopPropagation();
							onEdit();
						}}
						className="text-blue-600 hover:text-blue-700 transition-colors"
					>
						{"\u0420\u0435\u0434."}
					</button>
					<button
						onClick={(e) => {
							e.stopPropagation();
							onDelete();
						}}
						className="text-rose-500 hover:text-rose-600 transition-colors"
					>
						{"\u0423\u0434."}
					</button>
				</div>
			</div>
		</div>
	);
};

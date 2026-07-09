import React, { useState } from "react";
import { X, Share2, Trash2 } from "lucide-react";
import { IApiFile, IApiFolder } from "./lib";
import { If, Tooltip } from "@shared/ui";
import { UserAccessList } from "./UserAccessList";
import { useGetQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";

interface IProps {
	item: IApiFile | IApiFolder | null;
	type: "file" | "folder";
	onClose: () => void;
	onInvite: (userId: number) => Promise<void>;
	onRemoveShare: (shareId: number) => Promise<void>;
}

interface IShareData {
	id: number;
	shared_with_user_id?: number;
	user_id?: number;
	shared_with?: {
		id: number;
		full_name?: string;
		first_name?: string;
		last_name?: string;
	};
	user?: {
		id: number;
		full_name?: string;
		first_name?: string;
		last_name?: string;
	};
}

export const ShareFileModal = ({
	item,
	type,
	onClose,
	onInvite,
	onRemoveShare,
}: IProps) => {
	const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

	const sharesQuery = useGetQuery<
		any,
		{ success: boolean; data: IShareData[] | { data: IShareData[] } }
	>({
		url:
			item && type === "file"
				? ApiRoutes.MY_FILES_SHARES.replace(":id", String(item.id))
				: item && type === "folder"
					? ApiRoutes.MY_FILE_FOLDERS_SHARES.replace(":id", String(item.id))
					: "",
		useToken: true,
	});

	if (!item) return null;

	let activeShares: IShareData[] = [];
	if (sharesQuery.data?.data) {
		if (Array.isArray(sharesQuery.data.data)) {
			activeShares = sharesQuery.data.data;
		} else if (Array.isArray((sharesQuery.data.data as any).data)) {
			activeShares = (sharesQuery.data.data as any).data;
		}
	}

	const itemName =
		type === "file"
			? (item as IApiFile).original_name
			: (item as IApiFolder).name;

	const handleGrantAccess = async (e: React.FormEvent) => {
		e.preventDefault();
		if (selectedUsers.length === 0) return;

		for (const uId of selectedUsers) {
			await onInvite(uId);
		}

		setSelectedUsers([]);
		sharesQuery.refetch();
	};

	const handleRemove = async (shareId: number) => {
		await onRemoveShare(shareId);
		sharesQuery.refetch();
	};

	return (
		<div
			className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
			onClick={onClose}
		>
			<div
				className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
					<div className="flex items-center gap-3">
						<div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500! flex items-center justify-center text-white!">
							<Share2 size={16} />
						</div>
						<div>
							<h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100">
								Поделиться {type === "file" ? "файлом" : "папкой"}
							</h3>
							<p className="text-[10px] text-slate-400 dark:text-zinc-550 truncate max-w-[250px]">
								{itemName}
							</p>
						</div>
					</div>
					<button
						onClick={onClose}
						className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors cursor-pointer"
					>
						<X size={18} />
					</button>
				</div>

				<div className="p-6 overflow-y-auto space-y-5">
					<If is={activeShares.length > 0}>
						<div className="space-y-2">
							<span className="text-xs font-bold text-slate-400 dark:text-zinc-500 tracking-widest uppercase">
								УЖЕ ИМЕЮТ ДОСТУП
							</span>
							<div className="bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
								{activeShares.map((share) => {
									const targetUser = share.shared_with || share.user;
									const uName = targetUser
										? targetUser.full_name ||
											`${targetUser.first_name || ""} ${targetUser.last_name || ""}`.trim()
										: `Пользователь #${share.shared_with_user_id || share.user_id}`;
									return (
										<div
											key={share.id}
											className="flex items-center justify-between p-3"
										>
											<div className="flex items-center gap-3">
												<div className="w-8 h-8 rounded-full bg-indigo-500! flex items-center justify-center text-white! text-xs font-bold">
													{uName[0]?.toUpperCase() || "?"}
												</div>
												<div className="text-xs font-bold text-slate-700 dark:text-zinc-300">
													{uName}
												</div>
											</div>
											<Tooltip title="Закрыть доступ">
												<button
													type="button"
													onClick={() => handleRemove(share.id)}
													className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
												>
													<Trash2 size={14} />
												</button>
											</Tooltip>
										</div>
									);
								})}
							</div>
						</div>
					</If>

					<UserAccessList
						selectedUsers={selectedUsers}
						onToggleUser={(id) =>
							setSelectedUsers((prev) =>
								prev.includes(id)
									? prev.filter((x) => x !== id)
									: [...prev, id],
							)
						}
					/>

					<div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-zinc-400">
						<span className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
							Доступ
						</span>
						Приглашенный пользователь сможет только просматривать и скачивать
						содержимое.
					</div>
				</div>

				<div className="flex justify-end gap-3 p-6 border-t border-slate-100 dark:border-slate-800 shrink-0">
					<button
						type="button"
						onClick={onClose}
						className="px-6 py-2.5 rounded-full text-xs font-bold text-slate-600 dark:text-zinc-400 border border-slate-250 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer bg-white dark:bg-slate-900"
					>
						Отмена
					</button>
					<button
						type="button"
						onClick={handleGrantAccess}
						disabled={selectedUsers.length === 0}
						className={`px-6 py-2.5 rounded-full text-xs font-bold text-white! transition-opacity shadow-lg shadow-purple-500/10 ${
							selectedUsers.length > 0
								? "upload-btn-gradient cursor-pointer hover:opacity-90"
								: "bg-slate-300 dark:bg-slate-700 cursor-not-allowed"
						}`}
					>
						Предоставить доступ
					</button>
				</div>
			</div>
		</div>
	);
};


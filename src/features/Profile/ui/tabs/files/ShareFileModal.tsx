import React, { useState } from "react";
import { X, Share2, Trash2, Search } from "lucide-react";
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
	const [shareSearch, setShareSearch] = useState("");

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

	const getShareName = (share: IShareData): string => {
		const targetUser = share.shared_with || share.user;
		return targetUser
			? targetUser.full_name ||
					`${targetUser.first_name || ""} ${targetUser.last_name || ""}`.trim()
			: `Пользователь #${share.shared_with_user_id || share.user_id}`;
	};

	const filteredShares = activeShares.filter((share) =>
		getShareName(share).toLowerCase().includes(shareSearch.trim().toLowerCase()),
	);

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
				className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-2xl w-full max-w-[92vw]! md:max-w-[85vw]! xl:max-w-[1152px]! overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]"
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
							<p className="text-[10px] text-slate-400 dark:text-zinc-550 truncate max-w-[500px]">
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

				<div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800 overflow-hidden flex-1 min-h-[560px]!">
					{/* Слева — доступ и права */}
					<div className="flex-1 p-6 space-y-5 overflow-y-auto">
						<If is={activeShares.length > 0}>
							<div className="space-y-2">
								<span className="text-xs font-bold text-slate-400 dark:text-zinc-500 tracking-widest uppercase">
									УЖЕ ИМЕЮТ ДОСТУП ({activeShares.length})
								</span>

								<If is={activeShares.length > 5}>
									<div className="relative">
										<Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
										<input
											type="text"
											placeholder="Поиск среди тех, у кого есть доступ..."
											value={shareSearch}
											onChange={(e) => setShareSearch(e.target.value)}
											className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
										/>
									</div>
								</If>

								<div className="bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 max-h-[420px]! overflow-y-auto">
									<If is={filteredShares.length === 0}>
										<div className="p-4 text-center text-xs text-slate-400 dark:text-zinc-500">
											Ничего не найдено
										</div>
									</If>
									{filteredShares.map((share) => {
										const uName = getShareName(share);
										return (
											<div
												key={share.id}
												className="flex items-center justify-between p-3"
											>
												<div className="flex items-center gap-3 min-w-0">
													<div className="w-8 h-8 rounded-full bg-indigo-500! flex items-center justify-center text-white! text-xs font-bold shrink-0">
														{uName[0]?.toUpperCase() || "?"}
													</div>
													<div className="text-xs font-bold text-slate-700 dark:text-zinc-300 truncate">
														{uName}
													</div>
												</div>
												<Tooltip title="Закрыть доступ">
													<button
														type="button"
														onClick={() => handleRemove(share.id)}
														className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer shrink-0"
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

						<div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-zinc-400">
							<span className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
								Доступ
							</span>
							Приглашенный пользователь сможет только просматривать и скачивать
							содержимое.
						</div>
					</div>

					{/* Справа — доступ просмотр (поиск и выбор пользователей) */}
					<div className="flex-1 p-6 overflow-y-auto">
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


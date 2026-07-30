import React, { useState } from "react";
import { X, Share2 } from "lucide-react";
import { IApiFile, IApiFolder } from "./lib";
import { UserAccessList } from "./UserAccessList";
import { toast } from "@shared/lib/toast";
import { ShareActiveList } from "./ShareActiveList";
import { useSharesQuery } from "./useSharesQuery";

interface IProps {
	item: IApiFile | IApiFolder | null;
	type: "file" | "folder";
	onClose: () => void;
	onInvite: (userId: number) => Promise<void>;
	onRemoveShare: (shareId: number) => Promise<void>;
}

export const ShareFileModal = ({
	item,
	type,
	onClose,
	onInvite,
	onRemoveShare,
}: IProps) => {
	const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

	const { activeShares, refetchShares } = useSharesQuery(item, type);

	if (!item) return null;

	const itemName =
		type === "file"
			? (item as IApiFile).original_name
			: (item as IApiFolder).name;

	const handleGrantAccess = async (e: React.FormEvent) => {
		e.preventDefault();
		if (selectedUsers.length === 0) return;

		const count = selectedUsers.length;
		try {
			await Promise.all(selectedUsers.map((uId) => onInvite(uId)));
			toast.success(
				`Доступ успешно предоставлен (${count} ${
					count === 1 ? "пользователь" : "пользователей"
				})`,
			);
		} catch (err) {
			console.error("Ошибка отправки приглашений:", err);
			toast.error("Не удалось предоставить доступ");
		}

		setSelectedUsers([]);
		refetchShares();
	};

	const handleRemove = async (shareId: number) => {
		await onRemoveShare(shareId);
		refetchShares();
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

				<div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800 overflow-hidden flex-1 min-h-[300px] md:min-h-[500px]">
					{/* Слева — доступ и права */}
					<div className="flex-1 p-6 space-y-5 overflow-y-auto">
						<ShareActiveList
							activeShares={activeShares}
							onRemove={handleRemove}
						/>

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

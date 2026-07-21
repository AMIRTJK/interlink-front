import React, { useState } from "react";
import { X, Share2, FileText } from "lucide-react";
import { If } from "@shared/ui";
import { UserAccessList } from "./UserAccessList";
import { useCurrentUser } from "@shared/lib/hooks/useCurrentUser";
import { IApiFile } from "./lib";
import { toast } from "@shared/lib/toast";

interface IProps {
	selectedFiles: IApiFile[];
	onClose: () => void;
	onShare: (payload: { file_ids: number[]; user_ids: number[]; can_download: boolean }) => Promise<any>;
}

export const BulkShareModal = ({
	selectedFiles,
	onClose,
	onShare,
}: IProps) => {
	const { user } = useCurrentUser();
	const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
	const [canDownload, setCanDownload] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleGrantAccess = async (e: React.FormEvent) => {
		e.preventDefault();
		if (selectedUsers.length === 0 || selectedFiles.length === 0) return;

		const fileIds = selectedFiles.map((f) => f.id);
		const combinations = fileIds.length * selectedUsers.length;

		if (fileIds.length > 500) {
			toast.error("Превышен лимит: максимум 500 файлов за запрос");
			return;
		}
		if (selectedUsers.length > 50) {
			toast.error("Превышен лимит: максимум 50 пользователей за запрос");
			return;
		}
		if (combinations > 5000) {
			toast.error("Превышен лимит: максимум 5000 комбинаций за запрос");
			return;
		}

		setIsSubmitting(true);
		try {
			const res = await onShare({
				file_ids: fileIds,
				user_ids: selectedUsers,
				can_download: canDownload,
			});
			const createdCount = res?.data?.created_share_links_count ?? 0;
			toast.success(`Доступ успешно предоставлен. Создано ссылок: ${createdCount}`);
			setSelectedUsers([]);
			onClose();
		} catch (err) {
			console.error(err);
			toast.error("Не удалось предоставить доступ");
		} finally {
			setIsSubmitting(false);
		}
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
								Массовое предоставление доступа
							</h3>
							<p className="text-[10px] text-slate-400 dark:text-zinc-550 truncate max-w-[500px]">
								Выбрано файлов: {selectedFiles.length}
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
					<div className="flex-1 p-6 space-y-5 overflow-y-auto">
						<div className="space-y-2">
							<span className="text-xs font-bold text-slate-400 dark:text-zinc-500 tracking-widest uppercase">
								Выбранные файлы ({selectedFiles.length})
							</span>
							<div className="bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 max-h-[280px]! overflow-y-auto">
								{selectedFiles.map((file) => (
									<div
										key={file.id}
										className="flex items-center gap-3 p-3 text-xs font-semibold text-slate-700 dark:text-zinc-300"
									>
										<FileText size={14} className="text-slate-400 shrink-0" />
										<span className="truncate">{file.original_name}</span>
									</div>
								))}
							</div>
						</div>

						<div className="space-y-3">
							<span className="text-xs font-bold text-slate-400 dark:text-zinc-500 tracking-widest uppercase block">
								Настройки доступа
							</span>
							<div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
								<label className="flex items-center justify-between cursor-pointer">
									<div className="space-y-0.5">
										<span className="text-xs font-bold text-slate-700 dark:text-zinc-300 block">
											Разрешить скачивание
										</span>
										<span className="text-[11px] text-slate-400 dark:text-zinc-550">
											Пользователи смогут скачивать оригиналы файлов
										</span>
									</div>
									<div
										onClick={() => setCanDownload((prev) => !prev)}
										className={`w-10 h-6 rounded-full p-1 transition-all ${
											canDownload ? "bg-indigo-600!" : "bg-slate-300 dark:bg-slate-700"
										}`}
									>
										<div
											className={`bg-white w-4 h-4 rounded-full shadow-md transition-all transform ${
												canDownload ? "translate-x-4" : "translate-x-0"
											}`}
										/>
									</div>
								</label>
							</div>
						</div>
					</div>

					<div className="flex-1 p-6 overflow-y-auto">
						<UserAccessList
							selectedUsers={selectedUsers}
							excludeUserIds={user?.id ? [user.id] : undefined}
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
						disabled={selectedUsers.length === 0 || isSubmitting}
						className={`px-6 py-2.5 rounded-full text-xs font-bold text-white! transition-opacity shadow-lg shadow-purple-500/10 ${
							selectedUsers.length > 0 && !isSubmitting
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

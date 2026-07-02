import React, { useState } from "react";
import { X, FolderOpen } from "lucide-react";
import { If } from "@shared/ui";
import { ICategoryItem } from "../mockData";
import { EmojiPicker } from "./EmojiPicker";
import { UserAccessList } from "./UserAccessList";

interface IProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (category: ICategoryItem) => void;
}

export const AddCategoryModal = ({ isOpen, onClose, onSubmit }: IProps) => {
	const [folderName, setFolderName] = useState("");
	const [selectedEmoji, setSelectedEmoji] = useState("📁");
	const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

	const handleToggleUser = (userId: string) => {
		setSelectedUsers((prev) =>
			prev.includes(userId)
				? prev.filter((id) => id !== userId)
				: [...prev, userId],
		);
	};

	const handleFormSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (folderName.trim()) {
			onSubmit({
				name: folderName.trim(),
				icon: selectedEmoji,
				allowedUsers: selectedUsers,
			});
			setFolderName("");
			setSelectedEmoji("📁");
			setSelectedUsers([]);
			onClose();
		}
	};

	return (
		<If is={isOpen}>
			<div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
				<div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in duration-200">
					{/* Header */}
					<div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 dark:border-slate-800">
						<div className="flex items-center gap-3">
							<div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
								<FolderOpen
									size={18}
									className="fill-indigo-100 dark:fill-transparent"
								/>
							</div>
							<h3 className="text-lg font-bold text-slate-800 dark:text-zinc-100">
								Новая папка
							</h3>
						</div>
						<button
							onClick={onClose}
							className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
						>
							<X size={20} />
						</button>
					</div>

					<form
						onSubmit={handleFormSubmit}
						className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800"
					>
						{/* Left Column (Icon and Name) */}
						<div className="flex-1 p-6 space-y-6">
							<div className="space-y-4">
								<span className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 tracking-wider uppercase">
									ИКОНКА
								</span>

								<EmojiPicker
									selectedEmoji={selectedEmoji}
									onSelectEmoji={setSelectedEmoji}
								/>
							</div>

							<div className="space-y-2">
								<label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 tracking-wider uppercase">
									НАЗВАНИЕ
								</label>
								<input
									type="text"
									required
									placeholder="Название папки..."
									value={folderName}
									onChange={(e) => setFolderName(e.target.value)}
									className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
								/>
							</div>
						</div>

						{/* Right Column (Permissions) */}
						<div className="flex-1 p-8">
							<UserAccessList
								selectedUsers={selectedUsers}
								onToggleUser={handleToggleUser}
							/>
						</div>
					</form>

					{/* Footer */}
					<div className="flex justify-end gap-3 px-8 py-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
						<button
							type="button"
							onClick={onClose}
							className="px-6 py-2.5 rounded-full text-xs font-bold text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer bg-white dark:bg-slate-900"
						>
							Отмена
						</button>
						<button
							type="button"
							onClick={handleFormSubmit}
							className="px-6 py-2.5 rounded-full text-xs font-bold text-white! bg-indigo-600! hover:bg-indigo-700! transition-colors shadow-lg shadow-indigo-600/10 cursor-pointer"
						>
							Создать
						</button>
					</div>
				</div>
			</div>
		</If>
	);
};


import { Share2, Trash2 } from "lucide-react";

interface IProps {
	selectedCount: number;
	onShare: () => void;
	onDelete: () => void;
	onClear: () => void;
}

export const BulkActionsBar = ({
	selectedCount,
	onShare,
	onDelete,
	onClear,
}: IProps) => {
	return (
		<div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full px-6 py-3.5 shadow-2xl flex items-center gap-6 z-[9999] animate-in fade-in slide-in-from-bottom-4 duration-300">
			<span className="text-xs font-bold text-slate-700 dark:text-zinc-300">
				Выбрано файлов: {selectedCount}
			</span>
			<div className="h-4 w-px bg-slate-250 dark:bg-slate-750" />
			<button
				type="button"
				onClick={onShare}
				className="flex items-center gap-2 bg-indigo-600! hover:bg-indigo-700! text-white! px-4 py-2 rounded-full text-xs font-bold transition-all shadow-md cursor-pointer hover:opacity-90"
			>
				<Share2 size={13} />
				<span>Поделиться</span>
			</button>
			<button
				type="button"
				onClick={onDelete}
				className="flex items-center gap-2 bg-red-600! hover:bg-red-700! text-white! px-4 py-2 rounded-full text-xs font-bold transition-all shadow-md cursor-pointer hover:opacity-90"
			>
				<Trash2 size={13} />
				<span>Удалить</span>
			</button>
			<button
				type="button"
				onClick={onClear}
				className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer"
			>
				Снять выделение
			</button>
		</div>
	);
};

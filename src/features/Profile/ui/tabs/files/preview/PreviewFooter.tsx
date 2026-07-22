import { Download } from "lucide-react";

interface IProps {
	onClose: () => void;
	onDownload: () => void;
}

export const PreviewFooter = ({ onClose, onDownload }: IProps) => {
	return (
		<div className="flex justify-end gap-3 px-8 py-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
			<button
				type="button"
				onClick={onClose}
				className="px-6 py-2.5 rounded-full text-xs font-bold text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer bg-white dark:bg-slate-900"
			>
				Закрыть
			</button>
			<button
				type="button"
				onClick={onDownload}
				className="px-6 py-2.5 rounded-full text-xs font-bold text-white! bg-indigo-600! hover:bg-indigo-700! transition-colors shadow-lg shadow-indigo-600/10 flex items-center gap-2 cursor-pointer"
			>
				<Download size={14} />
				<span>Скачать файл</span>
			</button>
		</div>
	);
};

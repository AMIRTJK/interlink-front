import { Download } from "lucide-react";

interface IProps {
	onClose: () => void;
	onDownload: () => void;
}

export const PreviewFooter = ({ onClose, onDownload }: IProps) => {
	return (
		<div className="flex justify-end gap-3 px-8 py-5 border-t border-slate-100 dark:border-th-raised bg-slate-50/50 dark:bg-th-base/50">
			<button
				type="button"
				onClick={onClose}
				className="px-6 py-2.5 rounded-full text-xs font-bold text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-th-raised hover:bg-slate-100 dark:hover:bg-th-raised transition-colors cursor-pointer bg-white dark:bg-th-base"
			>
				Закрыть
			</button>
			<button
				type="button"
				onClick={onDownload}
				className="px-6 py-2.5 rounded-full text-xs font-bold text-white! bg-th-accent-600! hover:bg-th-accent-700! transition-colors shadow-lg shadow-th-accent-600/10 flex items-center gap-2 cursor-pointer"
			>
				<Download size={14} />
				<span>Скачать файл</span>
			</button>
		</div>
	);
};

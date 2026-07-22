import { X, Eye } from "lucide-react";

interface IProps {
	fileName: string;
	onClose: () => void;
}

export const PreviewHeader = ({ fileName, onClose }: IProps) => {
	return (
		<div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 dark:border-slate-800">
			<div className="flex items-center gap-2.5">
				<Eye size={18} className="text-indigo-600 dark:text-indigo-400" />
				<h3 className="text-base font-bold text-slate-800 dark:text-zinc-100 truncate max-w-[400px]">
					Просмотр: {fileName}
				</h3>
			</div>
			<button
				type="button"
				onClick={onClose}
				className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors cursor-pointer"
			>
				<X size={20} />
			</button>
		</div>
	);
};

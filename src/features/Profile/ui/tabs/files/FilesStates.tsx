import type { TFilesViewContext } from "./filesTabModel";

export const FilesLoadingState = () => {
	return (
		<div className="flex flex-col items-center justify-center py-20 text-slate-400">
			<div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
			<p className="text-sm font-semibold tracking-wide">
				Загрузка файлов...
			</p>
		</div>
	);
};

interface IEmptyStateProps {
	viewContext: TFilesViewContext;
}

export const FilesEmptyState = ({ viewContext }: IEmptyStateProps) => {
	return (
		<div className="flex flex-col items-center justify-center py-24 text-slate-400">
			<div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-2xl">
				📭
			</div>
			<h3 className="text-base font-bold text-slate-600 dark:text-zinc-300 mb-1">
				Пусто
			</h3>
			<p className="text-xs font-semibold max-w-xs text-center leading-relaxed">
				{viewContext === "shared"
					? "Вам еще не открывали доступ к файлам"
					: "В этой папке пока нет файлов."}
			</p>
		</div>
	);
};

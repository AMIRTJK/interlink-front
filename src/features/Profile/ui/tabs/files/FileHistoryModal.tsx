import React from "react";
import { X, History } from "lucide-react";
import { IFileItem } from "../mockData";

interface IHistoryEntry {
	id: string;
	action: string;
	date: string;
	dotColor: string;
	avatarBg: string;
	initials: string;
	userName: string;
}

interface IProps {
	file: IFileItem | null;
	onClose: () => void;
}

const MOCK_HISTORY: IHistoryEntry[] = [
	{
		id: "1",
		action: "Файл загружен",
		date: "10 мая 2025, 09:14",
		dotColor: "bg-emerald-500!",
		avatarBg:
			"bg-indigo-500/20! text-indigo-600! dark:bg-indigo-500/30! dark:text-indigo-400!",
		initials: "СС",
		userName: "Сайдазимов С.",
	},
	{
		id: "2",
		action: "Открыт для просмотра",
		date: "10 мая 2025, 11:32",
		dotColor: "bg-blue-400!",
		avatarBg:
			"bg-indigo-500/20! text-indigo-600! dark:bg-indigo-500/30! dark:text-indigo-400!",
		initials: "СС",
		userName: "Сайдазимов С.",
	},
	{
		id: "3",
		action: "Права доступа выданы",
		date: "11 мая 2025, 14:05",
		dotColor: "bg-indigo-400!",
		avatarBg:
			"bg-blue-500/20! text-blue-600! dark:bg-blue-500/30! dark:text-blue-400!",
		initials: "АМ",
		userName: "Алишер М.",
	},
	{
		id: "4",
		action: "Файл отредактирован",
		date: "13 мая 2025, 10:47",
		dotColor: "bg-amber-500!",
		avatarBg:
			"bg-purple-500/20! text-purple-600! dark:bg-purple-500/30! dark:text-purple-400!",
		initials: "ЗИ",
		userName: "Зарина И.",
	},
	{
		id: "5",
		action: "Скачан файл",
		date: "15 мая 2025, 16:20",
		dotColor: "bg-violet-400!",
		avatarBg:
			"bg-violet-500/20! text-violet-600! dark:bg-violet-500/30! dark:text-violet-400!",
		initials: "РН",
		userName: "Рустам Н.",
	},
	{
		id: "6",
		action: "Имя файла изменено",
		date: "17 мая 2025, 08:55",
		dotColor: "bg-rose-500!",
		avatarBg:
			"bg-indigo-500/20! text-indigo-600! dark:bg-indigo-500/30! dark:text-indigo-400!",
		initials: "СС",
		userName: "Сайдазимов С.",
	},
];

export const FileHistoryModal = ({ file, onClose }: IProps) => {
	if (!file) return null;

	return (
		<div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
			<div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
				{/* Header */}
				<div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
					<div className="flex items-center gap-3">
						<div className="w-9 h-9 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center text-violet-600 dark:text-violet-400">
							<History size={16} />
						</div>
						<div>
							<h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100">
								История редактирования
							</h3>
							<p className="text-[10px] text-slate-400 dark:text-zinc-550 truncate max-w-[250px]">
								{file.name}
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

				{/* Timeline Body */}
				<div className="p-6 max-h-[400px] overflow-y-auto space-y-3">
					{MOCK_HISTORY.map((item, index) => (
						<div
							key={item.id}
							className="grid grid-cols-[auto_1fr_auto] gap-4 items-center relative py-1.5"
						>
							{/* Dot & vertical line */}
							<div className="flex flex-col items-center justify-center w-6 h-full relative">
								<div className={`w-2 h-2 rounded-full ${item.dotColor} z-10`} />
								{index < MOCK_HISTORY.length - 1 && (
									<div className="w-[1.5px] bg-slate-100 dark:bg-slate-800 absolute top-4 bottom-[-16px]" />
								)}
							</div>

							{/* Event info */}
							<div className="flex flex-col justify-center">
								<h4 className="text-xs font-bold text-slate-700 dark:text-zinc-200">
									{item.action}
								</h4>
								<p className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 mt-0.5">
									{item.date}
								</p>
							</div>

							{/* Right user info */}
							<div className="flex items-center gap-2.5 w-32 flex-shrink-0 justify-start">
								<div
									className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${item.avatarBg}`}
								>
									{item.initials}
								</div>
								<span className="text-[10px] font-semibold text-slate-500 dark:text-zinc-450 truncate">
									{item.userName}
								</span>
							</div>
						</div>
					))}
				</div>

				{/* Footer */}
				<div className="flex justify-center p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
					<button
						type="button"
						onClick={onClose}
						className="px-8 py-2.5 rounded-full text-xs font-bold text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer bg-white dark:bg-slate-900 shadow-sm"
					>
						Закрыть
					</button>
				</div>
			</div>
		</div>
	);
};


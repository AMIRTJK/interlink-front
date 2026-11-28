import { motion } from "framer-motion";
import { If } from "@shared/ui";
import type { TFilesViewContext } from "./filesTabModel";

interface IProps {
	viewContext: TFilesViewContext;
	onViewContextChange: (val: TFilesViewContext) => void;
	personalCount: number;
	sharedCount: number;
}

export const FilesHeaderTabs = ({
	viewContext,
	onViewContextChange,
	personalCount,
	sharedCount,
}: IProps) => {
	const tabsData: { key: TFilesViewContext; label: string; count?: number }[] = [
		{ key: "personal", label: "Мои файлы", count: personalCount },
		{ key: "shared", label: "Доступные мне", count: sharedCount },
		{ key: "analytics", label: "Аналитика" },
	];

	return (
		<div className="flex items-center gap-4 border-b border-slate-200 dark:border-th-raised w-full md:w-auto">
			{tabsData.map((t) => {
				const isActive = viewContext === t.key;
				return (
					<button
						key={t.key}
						onClick={() => onViewContextChange(t.key)}
						className={`relative pb-2 px-1 font-bold text-base transition-colors cursor-pointer ${
							isActive
								? "text-slate-800 dark:text-zinc-100"
								: "text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300"
						}`}
					>
						<span>{t.label}</span>
						<If is={t.count !== undefined}>
							<span
								className={`ml-2 text-xs font-semibold px-2 py-0.5 rounded-full border ${
									isActive
										? "bg-th-accent-100 dark:bg-th-accent-900/35 text-th-accent-700 dark:text-th-accent-300 border-th-accent-200 dark:border-th-accent-800/50"
										: "ui-glass-soft bg-slate-100 dark:bg-th-raised/90 text-slate-500 dark:text-zinc-400 border-zinc-200 dark:border-th-high/50"
								}`}
							>
								{t.count}
							</span>
						</If>
						<If is={isActive}>
							<motion.div
								layoutId="filesActiveTabBorder"
								className="absolute bottom-0 left-0 right-0 h-0.5 bg-th-accent-600 rounded-full"
								transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
							/>
						</If>
					</button>
				);
			})}
		</div>
	);
};

import { useRef, useState, useEffect } from "react";
import { ChevronDown, ArrowUp, ArrowDown } from "lucide-react";
import { If, Tooltip } from "@shared/ui";
import { SORT_LABELS, SORT_OPTIONS } from "./filesHeaderModel";
import type { TFilesSort, TFilesSortDir } from "./filesTabModel";

interface IProps {
	sortBy: TFilesSort;
	onSortChange: (val: TFilesSort) => void;
	sortDir: TFilesSortDir;
	onSortDirToggle: () => void;
	accent: string;
}

export const FilesHeaderSort = ({
	sortBy,
	onSortChange,
	sortDir,
	onSortDirToggle,
	accent,
}: IProps) => {
	const [sortOpen, setSortOpen] = useState(false);
	const sortRef = useRef<HTMLDivElement>(null);
	const sortDirLabel = sortDir === "asc" ? "По возрастанию" : "По убыванию";

	useEffect(() => {
		if (!sortOpen) return;
		const handleClickOutside = (e: MouseEvent) => {
			if (sortRef.current && !sortRef.current.contains(e.target as Node))
				setSortOpen(false);
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [sortOpen]);

	return (
		<div className="flex items-center gap-3">
			<div className="relative" ref={sortRef}>
				<button
					onClick={() => setSortOpen((prev) => !prev)}
					className="flex items-center gap-1.5 px-4 py-2 ui-glass-soft bg-slate-50 dark:bg-th-raised/80 text-slate-600 dark:text-zinc-300 rounded-full border border-slate-200 dark:border-th-high text-sm hover:bg-slate-100 dark:hover:bg-th-high transition-all font-medium cursor-pointer"
				>
					<span>{SORT_LABELS[sortBy]}</span>
					<ChevronDown
						size={14}
						className={`text-slate-400 transition-transform ${sortOpen ? "rotate-180" : ""}`}
					/>
				</button>

				<If is={sortOpen}>
					<div className="absolute right-0 mt-1.5 w-32 bg-white dark:bg-th-raised border border-slate-100 dark:border-th-high rounded-2xl shadow-xl py-1 z-50">
						{SORT_OPTIONS.map((option) => (
							<button
								key={option}
								onClick={() => {
									onSortChange(option);
									setSortOpen(false);
								}}
								className={`w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer ${
									sortBy === option
										? "bg-slate-100 dark:bg-th-high/60 text-slate-800 dark:text-zinc-100 font-semibold"
										: "text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-th-high"
								}`}
								style={sortBy === option ? { color: accent } : undefined}
							>
								{SORT_LABELS[option]}
							</button>
						))}
					</div>
				</If>
			</div>

			<Tooltip title={sortDirLabel}>
				<button
					type="button"
					onClick={onSortDirToggle}
					aria-label={sortDirLabel}
					className="h-[38px] w-[38px] flex items-center justify-center ui-glass-soft bg-slate-50 dark:bg-th-raised/80 hover:bg-slate-100 dark:hover:bg-th-high border border-slate-200 dark:border-th-high rounded-full text-slate-500 dark:text-zinc-300 cursor-pointer transition-all"
				>
					{sortDir === "asc" ? <ArrowUp size={15} /> : <ArrowDown size={15} />}
				</button>
			</Tooltip>
		</div>
	);
};

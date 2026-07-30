import { useRef } from "react";
import { Upload, LayoutGrid, List, FolderPlus } from "lucide-react";
import { If } from "@shared/ui";
import { THEMES } from "@widgets/layout/ui/designSettings";
import { useDesignSettings } from "@widgets/layout/ui/useDesignSettings";
import type {
	TFilesSort,
	TFilesSortDir,
	TFilesViewContext,
	TFilesViewMode,
} from "./filesTabModel";
import { FilesHeaderTabs } from "./FilesHeaderTabs";
import { FilesHeaderSearch } from "./FilesHeaderSearch";
import { FilesHeaderSort } from "./FilesHeaderSort";

interface IProps {
	searchQuery: string;
	onSearchChange: (val: string) => void;
	sortBy: TFilesSort;
	onSortChange: (val: TFilesSort) => void;
	sortDir: TFilesSortDir;
	onSortDirToggle: () => void;
	viewMode: TFilesViewMode;
	onViewModeChange: (val: TFilesViewMode) => void;
	onUpload: (file: File) => void;
	personalCount: number;
	sharedCount: number;
	onCreateFolderClick: () => void;
	viewContext: TFilesViewContext;
	onViewContextChange: (val: TFilesViewContext) => void;
}

export const FilesHeader = ({
	searchQuery,
	onSearchChange,
	sortBy,
	onSortChange,
	sortDir,
	onSortDirToggle,
	viewMode,
	onViewModeChange,
	onUpload,
	personalCount,
	sharedCount,
	onCreateFolderClick,
	viewContext,
	onViewContextChange,
}: IProps) => {
	const fileInputRef = useRef<HTMLInputElement>(null);

	const { currentTheme, isDarkMode } = useDesignSettings();
	const theme = THEMES[currentTheme] || THEMES.emerald;
	const accent = isDarkMode ? theme.dark : theme.light;

	return (
		<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
			<FilesHeaderTabs
				viewContext={viewContext}
				onViewContextChange={onViewContextChange}
				personalCount={personalCount}
				sharedCount={sharedCount}
			/>

			<div className="flex flex-wrap items-center gap-3">
				<input
					type="file"
					ref={fileInputRef}
					onChange={(e) => {
						if (e.target.files?.[0]) {
							onUpload(e.target.files[0]);
							e.target.value = "";
						}
					}}
					className="hidden!"
				/>

				<FilesHeaderSearch
					searchQuery={searchQuery}
					onSearchChange={onSearchChange}
				/>

				<FilesHeaderSort
					sortBy={sortBy}
					onSortChange={onSortChange}
					sortDir={sortDir}
					onSortDirToggle={onSortDirToggle}
					accent={accent}
				/>

				<div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-full border border-slate-200/50 dark:border-slate-700/50">
					<button
						onClick={() => onViewModeChange("grid")}
						style={viewMode === "grid" ? { color: accent } : undefined}
						className={`p-1.5 rounded-full transition-all cursor-pointer ${
							viewMode === "grid"
								? "bg-white dark:bg-slate-700 shadow-sm"
								: "text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
						}`}
					>
						<LayoutGrid size={15} />
					</button>
					<button
						onClick={() => onViewModeChange("list")}
						style={viewMode === "list" ? { color: accent } : undefined}
						className={`p-1.5 rounded-full transition-all cursor-pointer ${
							viewMode === "list"
								? "bg-white dark:bg-slate-700 shadow-sm"
								: "text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
						}`}
					>
						<List size={15} />
					</button>
				</div>

				<If is={viewContext === "personal"}>
					<button
						onClick={onCreateFolderClick}
						className="flex items-center gap-2 px-5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-slate-700 font-semibold rounded-full text-sm shadow-sm cursor-pointer transition-all"
					>
						<FolderPlus
							size={16}
							className="text-slate-400 dark:text-zinc-400"
						/>
						<span>Создать папку</span>
					</button>
				</If>

				<If is={viewContext === "personal"}>
					<button
						onClick={() => fileInputRef.current?.click()}
						className={`bg-gradient-to-r ${theme.gradient} flex items-center gap-2 px-5 py-2 text-white font-semibold rounded-full text-sm shadow-md cursor-pointer hover:shadow-lg hover:brightness-105 transition-all`}
					>
						<Upload size={16} />
						<span>Загрузить</span>
					</button>
				</If>
			</div>
		</div>
	);
};

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { If } from "@shared/ui";

interface IProps {
	searchQuery: string;
	onSearchChange: (val: string) => void;
}

export const FilesHeaderSearch = ({ searchQuery, onSearchChange }: IProps) => {
	const [localSearch, setLocalSearch] = useState(searchQuery);

	useEffect(() => {
		setLocalSearch(searchQuery);
	}, [searchQuery]);

	return (
		<div className="relative w-full sm:w-64">
			<input
				type="text"
				placeholder="Поиск файлов..."
				value={localSearch}
				onChange={(e) => setLocalSearch(e.target.value)}
				onKeyDown={(e) => {
					if (e.key === "Enter") onSearchChange(localSearch);
				}}
				className="w-full bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-zinc-200 placeholder-slate-400 pl-4 pr-14 py-2 rounded-full border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
			/>
			<div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-2">
				<If is={!!localSearch}>
					<X
						size={15}
						className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
						onClick={() => {
							setLocalSearch("");
							onSearchChange("");
						}}
					/>
				</If>
				<Search
					size={15}
					className="text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
					onClick={() => onSearchChange(localSearch)}
				/>
			</div>
		</div>
	);
};

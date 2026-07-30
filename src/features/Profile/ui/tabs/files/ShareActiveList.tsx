import { useState } from "react";
import { Trash2, Search } from "lucide-react";
import { If, Tooltip } from "@shared/ui";
import { getUserPosition } from "./lib";
import { getShareName, type IShareData } from "./shareFileModalLib";

interface IProps {
	activeShares: IShareData[];
	onRemove: (shareId: number) => void;
}

export const ShareActiveList = ({ activeShares, onRemove }: IProps) => {
	const [shareSearch, setShareSearch] = useState("");

	const filteredShares = activeShares.filter((share) =>
		getShareName(share).toLowerCase().includes(shareSearch.trim().toLowerCase()),
	);

	return (
		<If is={activeShares.length > 0}>
			<div className="space-y-2">
				<span className="text-xs font-bold text-slate-400 dark:text-zinc-500 tracking-widest uppercase">
					УЖЕ ИМЕЮТ ДОСТУП ({activeShares.length})
				</span>

				<If is={activeShares.length > 5}>
					<div className="relative">
						<Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
						<input
							type="text"
							placeholder="Поиск среди тех, у кого есть доступ..."
							value={shareSearch}
							onChange={(e) => setShareSearch(e.target.value)}
							className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
						/>
					</div>
				</If>

				<div className="bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 max-h-[420px]! overflow-y-auto">
					<If is={filteredShares.length === 0}>
						<div className="p-4 text-center text-xs text-slate-400 dark:text-zinc-500">
							Ничего не найдено
						</div>
					</If>
					{filteredShares.map((share) => {
						const uName = getShareName(share);
						const uPosition = getUserPosition(share.shared_with || share.user);
						return (
							<div
								key={share.id}
								className="flex items-center justify-between p-3"
							>
								<div className="flex items-center gap-3 min-w-0">
									<div className="w-8 h-8 rounded-full bg-indigo-500! flex items-center justify-center text-white! text-xs font-bold shrink-0">
										{uName[0]?.toUpperCase() || "?"}
									</div>
									<div className="min-w-0">
										<div className="text-xs font-bold text-slate-700 dark:text-zinc-300 truncate">
											{uName}
										</div>
										<div className="text-[10px] text-slate-400 dark:text-zinc-500 truncate">
											{uPosition}
										</div>
									</div>
								</div>
								<Tooltip title="Закрыть доступ">
									<button
										type="button"
										onClick={() => onRemove(share.id)}
										className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer shrink-0"
									>
										<Trash2 size={14} />
									</button>
								</Tooltip>
							</div>
						);
					})}
				</div>
			</div>
		</If>
	);
};

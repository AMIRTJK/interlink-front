import { motion } from "framer-motion";
import { If } from "@shared/ui";
import { ISharedFolderEntry } from "./filesSharesLib";
import { FilesSharesEmptyBar } from "./FilesSharesEmptyBar";

interface IProps {
	data: ISharedFolderEntry[];
}

export const MySharesCard = ({ data }: IProps) => {
	return (
		<motion.div
			initial={{ opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3, delay: 0.18 }}
			className="rounded-3xl bg-white/70 dark:bg-slate-800/90 backdrop-blur-sm border border-white/40 dark:border-slate-700/50 shadow-md p-5 flex flex-col justify-between min-h-[340px]"
		>
			<div>
				<div className="flex items-center gap-2 mb-1">
					<span className="text-base">📤</span>
					<h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-200">
						С кем я делюсь
					</h3>
				</div>
				<p className="text-[11px] text-slate-400 dark:text-zinc-500 mb-4 ml-6">
					Файлов по получателям
				</p>

				<If is={data.length === 0}>
					<FilesSharesEmptyBar label="Вы ещё не делились файлами" icon="📁" />
				</If>

				<If is={data.length > 0}>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						{data.map((item, index) => (
							<motion.div
								key={item.folderName}
								initial={{ opacity: 0, y: 8 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.2, delay: index * 0.04 }}
								className="flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-slate-850/50 rounded-2xl border border-slate-100/70 dark:border-slate-800/40 hover:bg-slate-100/50 dark:hover:bg-slate-800/60 transition-all duration-200"
							>
								<div className="flex items-center gap-3 min-w-0">
									<div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center text-base shrink-0 border border-amber-100/20 dark:border-amber-900/10 shadow-sm">
										{item.emoji || "📁"}
									</div>
									<div className="min-w-0">
										<div className="text-[11px] font-bold text-slate-700 dark:text-zinc-200 truncate">
											{item.folderName}
										</div>
										<div className="text-[9px] text-slate-400 dark:text-zinc-500 truncate mt-0.5">
											Папка в хранилище
										</div>
									</div>
								</div>
								<span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 shrink-0 border border-amber-100/30 dark:border-amber-900/20">
									{item.count} ф.
								</span>
							</motion.div>
						))}
					</div>
				</If>
			</div>
		</motion.div>
	);
};

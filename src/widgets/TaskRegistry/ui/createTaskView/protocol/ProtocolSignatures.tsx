import * as React from "react";
import { Pen, Plus, CheckCircle2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@shared/lib";
import { Tooltip } from "@shared/ui";
import type { Colleague } from "../../../model/types";
import { signTimestamp } from "../../../lib/helpers";
import { Avatar } from "../../Avatar";

interface IProps {
	colleagues: Colleague[];
	chairmanColleague: Colleague | null;
	chairmanSigned: string | null;
	onChairmanSignedChange: (val: string | null) => void;
	onChairmanIdChange?: (id: string) => void;
	onChairmanSelectOpenChange?: (open: boolean) => void;
	secretaryColleague: Colleague | null;
	secretarySigned: string | null;
	onSecretarySignedChange: (val: string | null) => void;
	secretaryId: string;
	onSecretaryIdChange: (id: string) => void;
	secretaryAdding: boolean;
	onSecretaryAddingChange: (adding: boolean) => void;
	secretaryQuery: string;
	onSecretaryQueryChange: (val: string) => void;
	secretaryOpen: boolean;
	onSecretaryOpenChange: (open: boolean) => void;
}

export function ProtocolSignatures({
	colleagues,
	chairmanColleague,
	chairmanSigned,
	onChairmanSignedChange,
	onChairmanIdChange,
	onChairmanSelectOpenChange,
	secretaryColleague,
	secretarySigned,
	onSecretarySignedChange,
	secretaryId,
	onSecretaryIdChange,
	secretaryAdding,
	onSecretaryAddingChange,
	secretaryQuery,
	onSecretaryQueryChange,
	secretaryOpen,
	onSecretaryOpenChange,
}: IProps) {
	const secretaryRef = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				secretaryRef.current &&
				!secretaryRef.current.contains(e.target as Node)
			) {
				onSecretaryOpenChange(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [onSecretaryOpenChange]);

	const filteredSecretaryOptions = colleagues.filter(
		(c) =>
			c.id !== secretaryId &&
			c.name.toLowerCase().includes(secretaryQuery.toLowerCase()),
	);

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
			<div className="bg-linear-to-br from-white/95 to-[#d9e0f2]/40 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/80 dark:border-white/10 rounded-[2.5rem] p-7 shadow-[0_20px_60px_-10px_rgba(100,105,240,0.16)] dark:shadow-none space-y-5 relative z-10">
				<div className="flex items-center justify-between gap-4">
					<div className="flex items-center gap-3">
						<div className="w-9 h-9 rounded-xl bg-[#10b981] flex items-center justify-center text-white shadow-md shadow-emerald-200 shrink-0">
							<Pen size={18} />
						</div>
						<h3 className="text-lg font-black text-[#1e2548] dark:text-slate-100 tracking-tight">
							ЭЦП Руководителя
						</h3>
					</div>
					{chairmanSigned ? (
						<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 font-extrabold text-[9px] uppercase tracking-wider">
							<CheckCircle2 size={12} /> Подписано
						</span>
					) : chairmanColleague ? (
						<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-600 font-extrabold text-[9px] uppercase tracking-wider">
							Ожидает подписи
						</span>
					) : (
						<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-400 font-extrabold text-[9px] uppercase tracking-wider">
							Не выбран
						</span>
					)}
				</div>

				<div className="flex flex-col gap-3">
					<label className="text-[10px] font-black uppercase tracking-wider text-[#636e9c] block">
						ПРЕДСЕДАТЕЛЬ
					</label>

					{chairmanColleague ? (
						<Tooltip
							title={`${chairmanColleague.name} — ${chairmanColleague.role || "Сотрудник"}`}
						>
							<div className="bg-gradient-to-br from-white/95 to-[#d9e0f2]/40 border border-white/90 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-[0_4px_16px_rgba(100,105,240,0.06)]">
								<div className="flex items-center gap-3 min-w-0">
									<Avatar
										colleague={chairmanColleague}
										className="w-7 h-7 text-[10px]"
										allowPreview={false}
									/>
									<div className="min-w-0">
										<p className="text-xs font-bold text-[#1e2548] dark:text-slate-100 truncate">
											{chairmanColleague.name}
										</p>
										<p className="text-[10px] text-slate-400 truncate">
											{chairmanColleague.role || "Сотрудник"}
										</p>
									</div>
								</div>
								{onChairmanIdChange && (
									<button
										type="button"
										onClick={() => {
											onChairmanIdChange("");
											onChairmanSignedChange(null);
										}}
										className="text-slate-400 hover:text-rose-500 transition-colors shrink-0 cursor-pointer"
										title="Удалить выбор"
									>
										<X size={14} />
									</button>
								)}
							</div>
						</Tooltip>
					) : (
						<button
							type="button"
							onClick={() => onChairmanSelectOpenChange?.(true)}
							className="w-full bg-gradient-to-br from-white/95 to-[#d9e0f2]/40 border border-white/90 rounded-2xl p-5 text-center text-xs font-bold text-[#636e9c] shadow-[0_4px_16px_rgba(100,105,240,0.06)] cursor-pointer hover:bg-white flex items-center justify-center gap-1.5"
						>
							<Plus size={14} />
							<span>Добавить</span>
						</button>
					)}

					{chairmanSigned ? (
						<div className="p-4 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl text-center space-y-1">
							<p className="text-xs font-bold text-emerald-700">
								Подпись подтверждена
							</p>
							<p className="text-[10px] text-slate-400">{chairmanSigned}</p>
						</div>
					) : (
						<div className="bg-gradient-to-br from-white/95 to-[#d9e0f2]/40 border border-white/90 rounded-2xl p-5 text-center text-xs font-bold text-[#9aa2c8] uppercase tracking-wider shadow-[0_4px_16px_rgba(100,105,240,0.06)]">
							ЭЦП ПРЕДСЕДАТЕЛЯ
						</div>
					)}

					{!chairmanSigned && (
						<button
							type="button"
							onClick={() => onChairmanSignedChange(signTimestamp())}
							disabled={!chairmanColleague}
							className="px-5 py-2.5 bg-[#10b981] hover:bg-[#059669] disabled:opacity-50 text-white font-extrabold rounded-xl text-xs shadow-md shadow-emerald-200/60 transition-all cursor-pointer flex items-center gap-2"
						>
							<Pen size={13} />
							<span>Подписать ЭЦП</span>
						</button>
					)}
				</div>
			</div>

			{/* Card 4: ЭЦП Секретаря */}
			<div
				className={cn(
					"bg-gradient-to-br from-white/95 to-[#d9e0f2]/40 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/80 dark:border-white/10 rounded-[2.5rem] p-7 shadow-[0_20px_60px_-10px_rgba(100,105,240,0.16)] dark:shadow-none space-y-5 relative",
					secretaryOpen ? "z-30" : "z-10",
				)}
			>
				<div className="flex items-center justify-between gap-4">
					<div className="flex items-center gap-3">
						<div className="w-9 h-9 rounded-xl bg-[#10b981] flex items-center justify-center text-white shadow-md shadow-emerald-200 shrink-0">
							<Pen size={18} />
						</div>
						<h3 className="text-lg font-black text-[#1e2548] dark:text-slate-100 tracking-tight">
							ЭЦП Секретаря
						</h3>
					</div>
					{secretarySigned ? (
						<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 font-extrabold text-[9px] uppercase tracking-wider">
							<CheckCircle2 size={12} /> Подписано
						</span>
					) : (
						<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-600 font-extrabold text-[9px] uppercase tracking-wider">
							Ожидает подписи
						</span>
					)}
				</div>

				<div ref={secretaryRef} className="flex flex-col gap-3">
					<label className="text-[10px] font-black uppercase tracking-wider text-[#636e9c] block">
						СЕКРЕТАРЬ
					</label>

					{!secretaryColleague ? (
						secretaryAdding ? (
							<div className="relative">
								<input
									type="text"
									autoFocus
									value={secretaryQuery}
									onChange={(e) => {
										onSecretaryQueryChange(e.target.value);
										onSecretaryOpenChange(true);
									}}
									onFocus={() => onSecretaryOpenChange(true)}
									onClick={() => onSecretaryOpenChange(true)}
									className="w-full h-12 px-4 bg-gradient-to-br from-white/95 to-[#d9e0f2]/40 border border-white/90 rounded-2xl outline-none text-xs font-semibold text-[#1e2548] placeholder:text-[#9aa2c8] shadow-[0_4px_16px_rgba(100,105,240,0.06)]"
									placeholder="Выберите секретаря..."
								/>
								<AnimatePresence>
									{secretaryOpen && filteredSecretaryOptions.length > 0 && (
										<motion.div
											initial={{ opacity: 0, y: -4 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -4 }}
											transition={{ duration: 0.12 }}
											className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto divide-y divide-slate-100/60 dark:divide-white/5"
										>
											{filteredSecretaryOptions.map((col) => (
												<button
													key={col.id}
													type="button"
													onMouseDown={(e) => {
														e.preventDefault();
														onSecretaryIdChange(col.id);
														onSecretaryAddingChange(false);
														onSecretaryQueryChange("");
														onSecretaryOpenChange(false);
													}}
													className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors text-left cursor-pointer"
												>
													<Avatar
														colleague={col}
														className="w-7 h-7 text-[10px]"
														allowPreview={false}
													/>
													<div className="min-w-0 flex-1">
														<p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
															{col.name}
														</p>
														<p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
															{col.role || "Сотрудник"}
														</p>
													</div>
												</button>
											))}
										</motion.div>
									)}
								</AnimatePresence>
							</div>
						) : (
							<button
								type="button"
								onClick={() => onSecretaryAddingChange(true)}
								className="w-full bg-gradient-to-br from-white/95 to-[#d9e0f2]/40 border border-white/90 rounded-2xl p-5 text-center text-xs font-bold text-[#636e9c] shadow-[0_4px_16px_rgba(100,105,240,0.06)] cursor-pointer hover:bg-white flex items-center justify-center gap-1.5"
							>
								<Plus size={14} />
								<span>Добавить</span>
							</button>
						)
					) : (
						<Tooltip
							title={`${secretaryColleague.name} — ${secretaryColleague.role || "Сотрудник"}`}
						>
							<div className="bg-gradient-to-br from-white/95 to-[#d9e0f2]/40 border border-white/90 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-[0_4px_16px_rgba(100,105,240,0.06)]">
								<div className="flex items-center gap-3 min-w-0">
									<Avatar
										colleague={secretaryColleague}
										className="w-7 h-7 text-[10px]"
										allowPreview={false}
									/>
									<div className="min-w-0">
										<p className="text-xs font-bold text-[#1e2548] dark:text-slate-100 truncate">
											{secretaryColleague.name}
										</p>
										<p className="text-[10px] text-slate-400 truncate">
											{secretaryColleague.role || "Сотрудник"}
										</p>
									</div>
								</div>
								<button
									type="button"
									onClick={() => {
										onSecretaryIdChange("");
										onSecretarySignedChange(null);
									}}
									className="text-slate-400 hover:text-rose-500 transition-colors shrink-0"
								>
									<X size={14} />
								</button>
							</div>
						</Tooltip>
					)}

					{secretarySigned ? (
						<div className="p-4 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl text-center space-y-1">
							<p className="text-xs font-bold text-emerald-700">
								Подпись подтверждена
							</p>
							<p className="text-[10px] text-slate-400">{secretarySigned}</p>
						</div>
					) : (
						<div className="bg-gradient-to-br from-white/95 to-[#d9e0f2]/40 border border-white/90 rounded-2xl p-5 text-center text-xs font-bold text-[#9aa2c8] uppercase tracking-wider shadow-[0_4px_16px_rgba(100,105,240,0.06)]">
							ЭЦП СЕКРЕТАРЯ
						</div>
					)}

					{secretaryColleague && !secretarySigned && (
						<button
							type="button"
							onClick={() => onSecretarySignedChange(signTimestamp())}
							className="px-5 py-2.5 bg-[#10b981] hover:bg-[#059669] text-white font-extrabold rounded-xl text-xs shadow-md shadow-emerald-200/60 transition-all cursor-pointer flex items-center gap-2"
						>
							<Pen size={13} />
							<span>Подписать ЭЦП</span>
						</button>
					)}
				</div>
			</div>
		</div>
	);
}

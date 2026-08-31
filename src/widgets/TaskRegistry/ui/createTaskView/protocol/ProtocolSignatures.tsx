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
	chairmanIds?: string[];
	onToggleChairman?: (id: string) => void;
	onRemoveChairman?: (id: string) => void;
	onChairmanSelectOpenChange?: (open: boolean) => void;
	secretaryColleague: Colleague | null;
	secretarySigned: string | null;
	onSecretarySignedChange: (val: string | null) => void;
	secretaryId: string;
	onSecretaryIdChange: (id: string) => void;
	secretaryIds?: string[];
	onToggleSecretary?: (id: string) => void;
	onRemoveSecretary?: (id: string) => void;
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
	chairmanIds = [],
	onToggleChairman,
	onRemoveChairman,
	onChairmanSelectOpenChange,
	secretaryColleague,
	secretarySigned,
	onSecretarySignedChange,
	secretaryId,
	onSecretaryIdChange,
	secretaryIds = [],
	onToggleSecretary,
	onRemoveSecretary,
	secretaryAdding,
	onSecretaryAddingChange,
	secretaryQuery,
	onSecretaryQueryChange,
	secretaryOpen,
	onSecretaryOpenChange,
}: IProps) {
	const chairmanRef = React.useRef<HTMLDivElement>(null);
	const secretaryRef = React.useRef<HTMLDivElement>(null);

	const [chairmanAdding, setChairmanAdding] = React.useState(false);
	const [chairmanQuery, setChairmanQuery] = React.useState("");
	const [chairmanOpen, setChairmanOpen] = React.useState(false);

	React.useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			const target = e.target as Node;
			if (
				chairmanRef.current &&
				!chairmanRef.current.contains(target)
			) {
				setChairmanOpen(false);
			}
			if (
				secretaryRef.current &&
				!secretaryRef.current.contains(target)
			) {
				onSecretaryOpenChange(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [onSecretaryOpenChange]);

	const effectiveChairmanIds =
		chairmanIds.length > 0
			? chairmanIds
			: chairmanColleague
			? [chairmanColleague.id]
			: [];

	const selectedChairmen = React.useMemo(() => {
		return effectiveChairmanIds
			.map((id) => colleagues.find((c) => c.id === id))
			.filter(Boolean) as Colleague[];
	}, [effectiveChairmanIds, colleagues]);

	const filteredChairmanOptions = colleagues.filter(
		(c) =>
			!effectiveChairmanIds.includes(c.id) &&
			(c.name.toLowerCase().includes(chairmanQuery.toLowerCase()) ||
				(c.role && c.role.toLowerCase().includes(chairmanQuery.toLowerCase()))),
	);

	const handleAddChairman = (colId: string) => {
		if (onToggleChairman) {
			onToggleChairman(colId);
		} else if (onChairmanIdChange) {
			onChairmanIdChange(colId);
		}
		setChairmanAdding(false);
		setChairmanQuery("");
		setChairmanOpen(false);
	};

	const handleRemoveChairman = (colId: string) => {
		if (onRemoveChairman) {
			onRemoveChairman(colId);
		} else if (onChairmanIdChange) {
			onChairmanIdChange("");
			onChairmanSignedChange(null);
		}
	};

	const effectiveSecretaryIds =
		secretaryIds.length > 0 ? secretaryIds : secretaryId ? [secretaryId] : [];

	const selectedSecretaries = React.useMemo(() => {
		return effectiveSecretaryIds
			.map((id) => colleagues.find((c) => c.id === id))
			.filter(Boolean) as Colleague[];
	}, [effectiveSecretaryIds, colleagues]);

	const filteredSecretaryOptions = colleagues.filter(
		(c) =>
			!effectiveSecretaryIds.includes(c.id) &&
			(c.name.toLowerCase().includes(secretaryQuery.toLowerCase()) ||
				(c.role && c.role.toLowerCase().includes(secretaryQuery.toLowerCase()))),
	);

	const handleAddSecretary = (colId: string) => {
		if (onToggleSecretary) {
			onToggleSecretary(colId);
		} else {
			onSecretaryIdChange(colId);
		}
		onSecretaryAddingChange(false);
		onSecretaryQueryChange("");
		onSecretaryOpenChange(false);
	};

	const handleRemoveSecretary = (colId: string) => {
		if (onRemoveSecretary) {
			onRemoveSecretary(colId);
		} else {
			onSecretaryIdChange("");
			onSecretarySignedChange(null);
		}
	};

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
			{/* Card 3: ЭЦП Руководителя */}
			<div
				className={cn(
					"bg-gradient-to-br from-white/95 to-[#d9e0f2]/40 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/80 dark:border-white/10 rounded-[2.5rem] p-7 shadow-[0_20px_60px_-10px_rgba(100,105,240,0.16)] dark:shadow-none space-y-5 relative",
					chairmanOpen ? "z-30" : "z-10",
				)}
			>
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
					) : selectedChairmen.length > 0 ? (
						<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-600 font-extrabold text-[9px] uppercase tracking-wider">
							Ожидает подписи
						</span>
					) : (
						<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-400 font-extrabold text-[9px] uppercase tracking-wider">
							Не выбран
						</span>
					)}
				</div>

				<div ref={chairmanRef} className="flex flex-col gap-3">
					<label className="text-[10px] font-black uppercase tracking-wider text-[#636e9c] block">
						ПРЕДСЕДАТЕЛЬ {selectedChairmen.length > 0 && `(${selectedChairmen.length})`}
					</label>

					{/* List of selected chairmen */}
					{selectedChairmen.map((chair) => (
						<Tooltip
							key={chair.id}
							title={
								<div className="flex flex-col gap-0.5 py-0.5 text-left max-w-xs">
									<span className="font-bold text-white text-xs leading-tight">
										{chair.name}
									</span>
									{chair.role && (
										<span className="text-emerald-300 font-medium text-[11px] leading-tight">
											{chair.role}
										</span>
									)}
								</div>
							}
							placement="topLeft"
						>
							<div className="bg-gradient-to-br from-white/95 to-[#d9e0f2]/40 border border-white/90 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-[0_4px_16px_rgba(100,105,240,0.06)]">
								<div className="flex items-center gap-3 min-w-0">
									<Avatar
										colleague={chair}
										className="w-7 h-7 text-[10px]"
										allowPreview={false}
									/>
									<div className="min-w-0">
										<p className="text-xs font-bold text-[#1e2548] dark:text-slate-100 truncate">
											{chair.name}
										</p>
										<p className="text-[10px] text-slate-400 truncate">
											{chair.role || "Сотрудник"}
										</p>
									</div>
								</div>
								<button
									type="button"
									onClick={() => handleRemoveChairman(chair.id)}
									className="text-slate-400 hover:text-rose-500 transition-colors shrink-0 cursor-pointer"
									title="Удалить"
								>
									<X size={14} />
								</button>
							</div>
						</Tooltip>
					))}

					{/* Add Chairman Input or Button */}
					{chairmanAdding || selectedChairmen.length === 0 ? (
						<div className="relative">
							<input
								type="text"
								autoFocus={chairmanAdding}
								value={chairmanQuery}
								onChange={(e) => {
									setChairmanQuery(e.target.value);
									setChairmanOpen(true);
								}}
								onFocus={() => setChairmanOpen(true)}
								onClick={() => setChairmanOpen(true)}
								className="w-full h-12 px-4 bg-gradient-to-br from-white/95 to-[#d9e0f2]/40 border border-white/90 rounded-2xl outline-none text-xs font-semibold text-[#1e2548] placeholder:text-[#9aa2c8] shadow-[0_4px_16px_rgba(100,105,240,0.06)]"
								placeholder={
									selectedChairmen.length === 0
										? "Выберите председателя..."
										: "Добавить ещё руководителя..."
								}
							/>
							<AnimatePresence>
								{chairmanOpen && filteredChairmanOptions.length > 0 && (
									<motion.div
										initial={{ opacity: 0, y: -4 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -4 }}
										transition={{ duration: 0.12 }}
										className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto divide-y divide-slate-100/60 dark:divide-white/5"
									>
										{filteredChairmanOptions.map((col) => (
											<Tooltip
												key={col.id}
												title={
													<div className="flex flex-col gap-0.5 py-0.5 text-left max-w-xs">
														<span className="font-bold text-white text-xs leading-tight">
															{col.name}
														</span>
														{col.role && (
															<span className="text-emerald-300 font-medium text-[11px] leading-tight">
																{col.role}
															</span>
														)}
													</div>
												}
												placement="topLeft"
												mouseEnterDelay={0.1}
											>
												<button
													type="button"
													onMouseDown={(e) => {
														e.preventDefault();
														handleAddChairman(col.id);
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
											</Tooltip>
										))}
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					) : (
						<button
							type="button"
							onClick={() => setChairmanAdding(true)}
							className="w-full bg-gradient-to-br from-white/95 to-[#d9e0f2]/40 border border-dashed border-[#3373e5]/30 hover:border-[#3373e5] rounded-2xl p-3.5 text-center text-xs font-bold text-[#3373e5] shadow-2xs cursor-pointer hover:bg-white flex items-center justify-center gap-1.5 transition-all"
						>
							<Plus size={14} />
							<span>Добавить ещё руководителя</span>
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

					{selectedChairmen.length > 0 && !chairmanSigned && (
						<button
							type="button"
							onClick={() => onChairmanSignedChange(signTimestamp())}
							className="px-5 py-2.5 bg-[#10b981] hover:bg-[#059669] text-white font-extrabold rounded-xl text-xs shadow-md shadow-emerald-200/60 transition-all cursor-pointer flex items-center gap-2"
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
					) : selectedSecretaries.length > 0 ? (
						<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-600 font-extrabold text-[9px] uppercase tracking-wider">
							Ожидает подписи
						</span>
					) : (
						<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-400 font-extrabold text-[9px] uppercase tracking-wider">
							Не выбран
						</span>
					)}
				</div>

				<div ref={secretaryRef} className="flex flex-col gap-3">
					<label className="text-[10px] font-black uppercase tracking-wider text-[#636e9c] block">
						СЕКРЕТАРЬ {selectedSecretaries.length > 0 && `(${selectedSecretaries.length})`}
					</label>

					{/* List of selected secretaries */}
					{selectedSecretaries.map((sec) => (
						<Tooltip
							key={sec.id}
							title={
								<div className="flex flex-col gap-0.5 py-0.5 text-left max-w-xs">
									<span className="font-bold text-white text-xs leading-tight">
										{sec.name}
									</span>
									{sec.role && (
										<span className="text-emerald-300 font-medium text-[11px] leading-tight">
											{sec.role}
										</span>
									)}
								</div>
							}
							placement="topLeft"
						>
							<div className="bg-gradient-to-br from-white/95 to-[#d9e0f2]/40 border border-white/90 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-[0_4px_16px_rgba(100,105,240,0.06)]">
								<div className="flex items-center gap-3 min-w-0">
									<Avatar
										colleague={sec}
										className="w-7 h-7 text-[10px]"
										allowPreview={false}
									/>
									<div className="min-w-0">
										<p className="text-xs font-bold text-[#1e2548] dark:text-slate-100 truncate">
											{sec.name}
										</p>
										<p className="text-[10px] text-slate-400 truncate">
											{sec.role || "Сотрудник"}
										</p>
									</div>
								</div>
								<button
									type="button"
									onClick={() => handleRemoveSecretary(sec.id)}
									className="text-slate-400 hover:text-rose-500 transition-colors shrink-0 cursor-pointer"
									title="Удалить"
								>
									<X size={14} />
								</button>
							</div>
						</Tooltip>
					))}

					{/* Add Secretary Input or Button */}
					{secretaryAdding || selectedSecretaries.length === 0 ? (
						<div className="relative">
							<input
								type="text"
								autoFocus={secretaryAdding}
								value={secretaryQuery}
								onChange={(e) => {
									onSecretaryQueryChange(e.target.value);
									onSecretaryOpenChange(true);
								}}
								onFocus={() => onSecretaryOpenChange(true)}
								onClick={() => onSecretaryOpenChange(true)}
								className="w-full h-12 px-4 bg-gradient-to-br from-white/95 to-[#d9e0f2]/40 border border-white/90 rounded-2xl outline-none text-xs font-semibold text-[#1e2548] placeholder:text-[#9aa2c8] shadow-[0_4px_16px_rgba(100,105,240,0.06)]"
								placeholder={
									selectedSecretaries.length === 0
										? "Выберите секретаря..."
										: "Добавить ещё секретаря..."
								}
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
											<Tooltip
												key={col.id}
												title={
													<div className="flex flex-col gap-0.5 py-0.5 text-left max-w-xs">
														<span className="font-bold text-white text-xs leading-tight">
															{col.name}
														</span>
														{col.role && (
															<span className="text-emerald-300 font-medium text-[11px] leading-tight">
																{col.role}
															</span>
														)}
													</div>
												}
												placement="topLeft"
												mouseEnterDelay={0.1}
											>
												<button
													type="button"
													onMouseDown={(e) => {
														e.preventDefault();
														handleAddSecretary(col.id);
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
											</Tooltip>
										))}
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					) : (
						<button
							type="button"
							onClick={() => onSecretaryAddingChange(true)}
							className="w-full bg-gradient-to-br from-white/95 to-[#d9e0f2]/40 border border-dashed border-[#3373e5]/30 hover:border-[#3373e5] rounded-2xl p-3.5 text-center text-xs font-bold text-[#3373e5] shadow-2xs cursor-pointer hover:bg-white flex items-center justify-center gap-1.5 transition-all"
						>
							<Plus size={14} />
							<span>Добавить ещё секретаря</span>
						</button>
					)}

					{secretarySigned ? (
						<div className="p-4 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl text-center space-y-1">
							<p className="text-xs font-bold text-emerald-700">
								Подпись подтверждена
							</p>
							<p className="text-[10px] text-slate-400">{secretarySigned}</p>
						</div>
					) : (
						<div className="bg-linear-to-br from-white/95 to-[#d9e0f2]/40 border border-white/90 rounded-2xl p-5 text-center text-xs font-bold text-[#9aa2c8] uppercase tracking-wider shadow-[0_4px_16px_rgba(100,105,240,0.06)]">
							ЭЦП СЕКРЕТАРЯ
						</div>
					)}

					{selectedSecretaries.length > 0 && !secretarySigned && (
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

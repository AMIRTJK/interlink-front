import { useState } from "react";
import { motion } from "framer-motion";
import {
	X,
	Mail,
	Phone,
	Building2,
	Briefcase,
	Wallet,
	Pencil,
	Trash2,
	Copy,
	CircleUserRound,
	Activity,
	FolderOpen,
	Calendar,
	ScrollText,
	Hash,
	CreditCard,
	Landmark,
	MapPin,
	User,
	Users,
	Shield,
	FileText,
	Search,
} from "lucide-react";
import { IEmployee, money, statusMeta } from "./model";
import { Avatar, Field, Section, ActivityTab, DocsTab } from "./parts";
import { If } from "@shared/ui";

interface IProps {
	employee: IEmployee;
	onClose: () => void;
	onEdit: (e: IEmployee) => void;
	onDelete: (id: number) => void;
	onDuplicate: (e: IEmployee) => void;
}

type TTab = "info" | "activity" | "docs";

const STATUS_STYLE: Record<string, { chip: string; dot: string }> = {
	active: { chip: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
	vacation: { chip: "bg-red-100 text-red-700", dot: "bg-red-500" },
	business_trip: { chip: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
};

const TABS: { key: TTab; label: string; icon: React.ReactNode }[] = [
	{ key: "info", label: "Информация", icon: <CircleUserRound size={15} /> },
	{ key: "activity", label: "Активность", icon: <Activity size={15} /> },
	{ key: "docs", label: "Документы", icon: <FolderOpen size={15} /> },
];

const formatDate = (s?: string) => {
	if (!s) return "—";
	const d = new Date(s);
	return isNaN(d.getTime()) ? s : d.toLocaleDateString("ru-RU");
};

const genderLabel = (g?: string) =>
	g === "male" ? "Мужской" : g === "female" ? "Женский" : g || "—";

export const EmployeeProfileModal = ({
	employee: e,
	onClose,
	onEdit,
	onDelete,
	onDuplicate,
}: IProps) => {
	const [tab, setTab] = useState<TTab>("info");
	const [showPhotoModal, setShowPhotoModal] = useState(false);
	const r = e.raw;
	const st = STATUS_STYLE[e.status] || {
		chip: "bg-gray-100 text-gray-500",
		dot: "bg-gray-400",
	};

	const passport = [r.passport_series, r.passport_number]
		.filter(Boolean)
		.join(" ");
	const roles = (r.roles || []).map((x) => x.name).join(", ");
	const supervisor = r.supervisor?.full_name || e.supervisorName;
	const organization = r.organization?.name || "—";

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className={`fixed inset-0 z-[9998] bg-slate-900/40 backdrop-blur-sm flex items-end justify-center ${showPhotoModal ? "pointer-events-none" : ""}`}
			onClick={() => !showPhotoModal && onClose()}
		>
			<motion.div
				initial={{ y: "100%" }}
				animate={{ y: 0 }}
				exit={{ y: "100%" }}
				transition={{ type: "spring", stiffness: 360, damping: 36 }}
				onClick={(ev) => ev.stopPropagation()}
				className="relative w-full max-w-3xl bg-white border-t border-gray-100 shadow-2xl flex flex-col z-50 rounded-t-3xl h-[90vh]"
			>
				<div className="flex justify-center pt-3 pb-1 shrink-0">
					<div className="w-10 h-1 rounded-full bg-gray-300" />
				</div>
				<div
					className="h-[3px] w-full mt-2 shrink-0"
					style={{
						background:
							"linear-gradient(90deg, rgb(99, 102, 241), rgba(99, 102, 241, 0.533), transparent)",
					}}
				/>

				<div className="flex-1 overflow-y-auto">
					<div className="px-6 pt-5 pb-5 border-b border-gray-100">
						<div className="flex items-start justify-between mb-4">
							<span
								className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${st.chip}`}
							>
								<span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
								{statusMeta(e.status).label}
							</span>
							<button
								onClick={onClose}
								className="p-1.5 rounded-xl transition-colors hover:bg-gray-100 text-gray-400"
							>
								<X size={18} />
							</button>
						</div>
						<div className="flex items-center gap-5">
							<div
								onClick={() => e.photo && setShowPhotoModal(true)}
								className={`relative rounded-2xl overflow-hidden shrink-0 group ${e.photo ? "cursor-pointer" : ""}`}
								style={{ boxShadow: "rgba(99, 102, 241, 0.333) 0px 8px 28px" }}
							>
								<Avatar e={e} size={80} rounded="rounded-2xl" />
								{e.photo && (
									<div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all rounded-2xl flex items-center justify-center">
										<div className="relative flex items-center justify-center">
											<div
												className="absolute inset-0 bg-white/20 rounded-full blur-md"
												style={{ width: 40, height: 40 }}
											/>
											<Search
												size={20}
												className="text-white opacity-0 group-hover:opacity-100 transition-opacity relative"
											/>
										</div>
									</div>
								)}
							</div>
							<div className="flex-1 min-w-0">
								<h2 className="text-xl font-bold text-gray-900 leading-tight">
									{e.nameMain}
								</h2>
								{e.middleName && (
									<p className="text-sm text-gray-500 mt-0.5">{e.middleName}</p>
								)}
								<p className="text-sm font-semibold text-indigo-500 mt-1">
									{e.position}
								</p>
							</div>
						</div>
					</div>

					<div className="px-6 pt-4 pb-2 border-b border-gray-100">
						<div className="flex gap-1 p-1 rounded-xl bg-gray-100 w-fit">
							{TABS.map((t) => (
								<button
									key={t.key}
									onClick={() => setTab(t.key)}
									className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
										tab === t.key
											? "bg-white text-gray-900 shadow-sm"
											: "text-gray-500 hover:text-gray-700"
									}`}
								>
									{t.icon}
									<span>{t.label}</span>
								</button>
							))}
						</div>
					</div>

					<div className="px-6 py-5">
						<If is={tab === "info"}>
							<If is={!!r.bio}>
								<div className="mb-4 pb-4 border-b border-gray-100">
									<p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">
										Биография
									</p>
									<div className="flex gap-3 p-4 rounded-xl bg-gray-50">
										<div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0">
											<FileText size={15} className="text-indigo-400" />
										</div>
										<p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line break-words">
											{r.bio}
										</p>
									</div>
								</div>
							</If>

							<Section title="Персональные данные">
								<Field
									icon={<Calendar size={15} />}
									label="Дата рождения"
									value={formatDate(r.birth_date)}
								/>
								<Field
									icon={<User size={15} />}
									label="Пол"
									value={genderLabel(r.gender)}
								/>
								<Field
									icon={<ScrollText size={15} />}
									label="Номер паспорта"
									value={passport}
								/>
								<Field icon={<Hash size={15} />} label="ИНН" value={r.inn} />
								<Field
									icon={<MapPin size={15} />}
									label="Адрес"
									value={r.address}
								/>
								<Field
									icon={<CreditCard size={15} />}
									label="Банковский счёт"
									value={r.bank_account}
								/>
							</Section>

							<Section title="Рабочие данные">
								<Field
									icon={<Briefcase size={15} />}
									label="Должность"
									value={e.position}
								/>
								<Field
									icon={<Building2 size={15} />}
									label="Отдел"
									value={e.department}
								/>
								<Field
									icon={<Landmark size={15} />}
									label="Организация"
									value={organization}
								/>
								<Field
									icon={<Users size={15} />}
									label="Руководитель"
									value={supervisor}
								/>
								<Field icon={<Shield size={15} />} label="Роль" value={roles} />
								<Field
									icon={<Mail size={15} />}
									label="Персональный Email"
									value={e.personalEmail}
								/>
								<Field
									icon={<Phone size={15} />}
									label="Персональный телефон"
									value={e.personalPhone}
								/>
								<Field
									icon={<Mail size={15} />}
									label="Корпоративный Email"
									value={e.corporateEmail}
								/>
								<Field
									icon={<Phone size={15} />}
									label="Корпоративный телефон"
									value={e.corporatePhone}
								/>
								<Field
									icon={<Phone size={15} />}
									label="Логин"
									value={r.phone}
								/>
								<Field
									icon={<Wallet size={15} />}
									label="Заработная плата"
									value={money(e.salary)}
									accent
								/>
							</Section>
						</If>

						<If is={tab === "activity"}>
							<ActivityTab />
						</If>

						<If is={tab === "docs"}>
							<DocsTab />
						</If>
					</div>
				</div>

				<div className="px-6 py-4 border-t border-gray-100 shrink-0">
					<div className="flex gap-2">
						<button
							onClick={() => onEdit(e)}
							className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold shadow-lg shadow-indigo-900/30 hover:bg-indigo-700 transition-colors"
						>
							<Pencil size={15} />
							<span>Редактировать</span>
						</button>
						<button
							onClick={() => onDelete(e.id)}
							className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 text-sm font-semibold transition-colors"
						>
							<Trash2 size={15} />
						</button>
						<button
							onClick={() => onDuplicate(e)}
							className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm font-semibold transition-colors"
							title="Дублировать"
						>
							<Copy size={15} />
						</button>
					</div>
				</div>
			</motion.div>

			{/* Photo Modal */}
			<If is={showPhotoModal && e.photo}>
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center pointer-events-auto"
					onClick={() => setShowPhotoModal(false)}
				>
					<motion.div
						initial={{ scale: 0.9, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 0.9, opacity: 0 }}
						onClick={(ev) => ev.stopPropagation()}
						className="relative max-w-2xl max-h-[90vh]"
					>
						<button
							onClick={() => setShowPhotoModal(false)}
							className="absolute -top-10 right-0 p-2 rounded-full text-white hover:bg-white/20 transition-colors"
						>
							<X size={24} />
						</button>
						<img
							src={e.photo}
							alt={e.fullName}
							onClick={(e) => e.stopPropagation()}
							className="rounded-2xl max-w-full max-h-[90vh] object-contain shadow-2xl"
						/>
					</motion.div>
				</motion.div>
			</If>
		</motion.div>
	);
};

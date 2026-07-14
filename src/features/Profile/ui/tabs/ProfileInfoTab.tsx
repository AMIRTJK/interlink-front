import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
	Phone,
	FileText,
	Building2,
	Briefcase,
	Calendar as CalendarIcon,
	Camera,
	Mail,
	MapPin,
} from "lucide-react";
import { IUser } from "@entities/login";
import { ApiRoutes } from "@shared/api";
import { useMutationQuery } from "@shared/lib/hooks";
import { toast } from "@shared/lib/toast";
import { Loader } from "@shared/ui";
import { getEnvVar } from "@shared/config";
import userAvatar from "../../../../assets/images/user-avatar.jpg";
import { THEMES } from "@widgets/layout/ui/designSettings";

const resolvePhotoUrl = (path?: string | null): string => {
	if (!path) return "";
	if (
		path.startsWith("http://") ||
		path.startsWith("https://") ||
		path.startsWith("data:")
	) {
		return path;
	}
	const apiHost = getEnvVar("VITE_API_URL") || "";
	const host = apiHost.endsWith("/") ? apiHost.slice(0, -1) : apiHost;
	// Файлы хранятся на публичном диске Laravel и отдаются под /storage/.
	// photo_path приходит относительным (напр. "user-photos/1/xxx.jfif").
	let p = path.replace(/^\/+/, "");
	if (!p.startsWith("storage/")) p = `storage/${p}`;
	return `${host}/${p}`;
};

interface IProps {
	userData: IUser | null;
	isLoading: boolean;
	onEdit: () => void;
	currentTheme?: string;
}

// Ограничение Backend на размер фото профиля — 5 MB.
const MAX_PHOTO_SIZE_MB = 5;

const NOT_SET = "Не указано";

const orDash = (value?: string | null): string =>
	value && String(value).trim() ? String(value) : NOT_SET;

const formatDate = (iso?: string | null): string => {
	if (!iso) return NOT_SET;
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return NOT_SET;
	return d.toLocaleDateString("ru-RU", {
		day: "numeric",
		month: "long",
		year: "numeric",
	});
};

interface IInfoRowProps {
	icon: React.ReactNode;
	label: string;
	value: string;
}

const InfoRow = ({ icon, label, value }: IInfoRowProps) => (
	<div className="flex items-start gap-3">
		<span className="text-zinc-400 mt-0.5 shrink-0">{icon}</span>
		<div className="min-w-0">
			<span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
				{label}
			</span>
			<span
				className={`text-sm font-medium break-words ${
					value === NOT_SET
						? "text-zinc-400 dark:text-zinc-500 italic"
						: "text-zinc-800 dark:text-zinc-200"
				}`}
			>
				{value}
			</span>
		</div>
	</div>
);

const Card = ({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) => (
	<div className="bg-white/40 dark:bg-slate-800/90 backdrop-blur-3xl p-6 rounded-[2.5rem] border border-white/20 dark:border-slate-700/50 shadow-sm">
		<h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-4">
			{title}
		</h3>
		<div className="grid grid-cols-1 md:grid-cols-2 gap-5">{children}</div>
	</div>
);

export const ProfileInfoTab = ({
	userData,
	isLoading,
	onEdit,
	currentTheme,
}: IProps) => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [avatarError, setAvatarError] = useState(false);

	useEffect(() => {
		setAvatarError(false);
	}, [userData?.photo_path]);
	const themeKey =
		currentTheme || localStorage.getItem("currentTheme") || "emerald";
	const activeTheme = THEMES[themeKey] || THEMES.emerald;

	// Фото профиля обновляется напрямую через PATCH /api/v1/auth/me (multipart).
	// Шлём POST-ом с _method=PATCH — PHP не разбирает файлы в теле настоящих PATCH.
	const { mutate: uploadAvatar, isPending: isUploading } =
		useMutationQuery<FormData>({
			url: ApiRoutes.UPDATE_ME,
			method: "POST",
			messages: {
				success: "Фото профиля обновлено",
				error: "Ошибка при загрузке фото",
				invalidate: [ApiRoutes.AUTH_ME],
			},
		});

	const handleAvatarClick = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			if (!file.type.startsWith("image/")) {
				toast.error("Загрузите изображение (JPG, PNG или WEBP)");
			} else if (file.size > MAX_PHOTO_SIZE_MB * 1024 * 1024) {
				toast.error(`Файл больше ${MAX_PHOTO_SIZE_MB} MB`);
			} else {
				const formData = new FormData();
				formData.append("_method", "PATCH");
				formData.append("photo", file);
				uploadAvatar(formData);
			}
		}
		e.target.value = "";
	};

	if (isLoading) {
		return (
			<div className="flex justify-center items-center min-h-110">
				<Loader />
			</div>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className="grid grid-cols-1 lg:grid-cols-3 gap-6"
		>
			<div className="lg:col-span-1">
				<div className="bg-white/40 dark:bg-slate-800/90 backdrop-blur-3xl p-6 rounded-[2.5rem] border border-white/20 dark:border-slate-700/50 shadow-sm flex flex-col items-center">
					<div className="relative mb-4">
						<button
							type="button"
							onClick={handleAvatarClick}
							aria-label="Изменить фото профиля"
							className={`group relative block rounded-[2.5rem] overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-400/40 ${
								isUploading
									? "opacity-60 pointer-events-none"
									: "cursor-pointer"
							}`}
						>
							<img
								src={
									avatarError
										? userAvatar
										: resolvePhotoUrl(userData?.photo_path) || userAvatar
								}
								alt="Аватар"
								className="w-64 h-64 rounded-[2.5rem] border-2 border-white/60 dark:border-zinc-900/60 object-cover shadow-lg"
								onError={() => setAvatarError(true)}
							/>
							<span className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-1 text-white opacity-0 group-hover:opacity-100 transition-opacity">
								<Camera size={26} />
								<span className="text-xs font-semibold">
									{isUploading ? "Загрузка…" : "Изменить фото"}
								</span>
							</span>
						</button>
						<span className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white/60 dark:border-zinc-900/60 bg-emerald-500 shadow-lg" />
						<input
							type="file"
							ref={fileInputRef}
							className="hidden"
							accept="image/*"
							onChange={handleFileChange}
						/>
					</div>
					<h2 className="text-base font-bold text-zinc-900 dark:text-white text-center">
						{orDash(userData?.full_name)}
					</h2>
					<p className="text-xs text-zinc-550 dark:text-zinc-400 mt-1">
						{orDash(userData?.position)}
					</p>
					<p className="text-xs text-zinc-550 dark:text-zinc-400">
						{orDash(userData?.organization?.name)}
					</p>
					<button
						type="button"
						onClick={onEdit}
						className={`mt-5 w-full bg-linear-to-r ${activeTheme.gradient} hover:opacity-90 text-white py-2.5 rounded-[2.5rem] text-sm font-semibold transition-all shadow-md`}
					>
						Настройки
					</button>
				</div>
			</div>

			<div className="lg:col-span-2 space-y-6">
				<Card title="Личная информация">
					<InfoRow
						icon={<Mail size={16} />}
						label="Email"
						value={orDash(userData?.personal_email)}
					/>
					<InfoRow
						icon={<Phone size={16} />}
						label="Телефон"
						value={orDash(userData?.phone)}
					/>
					<InfoRow
						icon={<CalendarIcon size={16} />}
						label="Дата рождения"
						value={formatDate(
							(userData as any)?.birth_date || (userData as any)?.birthday,
						)}
					/>
					<InfoRow
						icon={<MapPin size={16} />}
						label="Адрес"
						value={orDash((userData as any)?.address)}
					/>
					<InfoRow
						icon={<FileText size={16} />}
						label="ИНН"
						value={orDash(userData?.inn)}
					/>
				</Card>

				<Card title="Рабочие данные">
					<InfoRow
						icon={<Building2 size={16} />}
						label="Организация"
						value={orDash(userData?.organization?.name)}
					/>
					<InfoRow
						icon={<Briefcase size={16} />}
						label="Должность"
						value={orDash(userData?.position)}
					/>
					<InfoRow
						icon={<Mail size={16} />}
						label="Корпоративный Email"
						value={orDash((userData as any)?.work_email)}
					/>
					<InfoRow
						icon={<Phone size={16} />}
						label="Корпоративный телефон"
						value={orDash((userData as any)?.work_phone)}
					/>
				</Card>

				<Card title="Биография">
					<div className="col-span-full">
						<p
							className={`text-sm font-medium leading-relaxed whitespace-pre-line ${
								!userData?.bio
									? "text-zinc-400 dark:text-zinc-500 italic"
									: "text-zinc-800 dark:text-zinc-200"
							}`}
						>
							{userData?.bio ? userData.bio : "Не указано"}
						</p>
					</div>
				</Card>
			</div>
		</motion.div>
	);
};

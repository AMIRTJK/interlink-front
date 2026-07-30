import { memo } from "react";
import { motion } from "framer-motion";
import {
	Phone,
	FileText,
	Building2,
	Briefcase,
	Calendar as CalendarIcon,
	Mail,
	MapPin,
} from "lucide-react";
import { IUser } from "@entities/login";
import { Loader, If } from "@shared/ui";
import { THEMES } from "@widgets/layout/ui/designSettings";
import { ProfileAvatarCard } from "./profileInfo/ProfileAvatarCard";
import { Card, InfoRow } from "./profileInfo/ProfileInfoCards";
import { formatDate, orDash } from "./profileInfo/profileInfoLib";

interface IProps {
	userData: IUser | null;
	isLoading: boolean;
	onEdit: () => void;
	currentTheme?: string;
}

export const ProfileInfoTab = memo(({
	userData,
	isLoading,
	onEdit,
	currentTheme,
}: IProps) => {
	const themeKey =
		currentTheme || localStorage.getItem("currentTheme") || "emerald";
	const activeTheme = THEMES[themeKey] || THEMES.emerald;

	return (
		<div>
			<If is={isLoading}>
				<div className="flex! justify-center! items-center! min-h-110!">
					<Loader />
				</div>
			</If>

			<If is={!isLoading}>
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="grid! grid-cols-1! lg:grid-cols-3! gap-6!"
				>
					<div className="lg:col-span-1!">
						<ProfileAvatarCard
							userData={userData}
							onEdit={onEdit}
							gradient={activeTheme.gradient}
						/>
					</div>

					<div className="lg:col-span-2! space-y-6!">
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
							<div className="col-span-full!">
								<p
									className={`text-sm! font-medium! leading-relaxed! whitespace-pre-line! ${
										!userData?.bio
											? "text-zinc-400! dark:text-zinc-500! italic!"
											: "text-zinc-800! dark:text-zinc-200!"
									}`}
								>
									{userData?.bio ? userData.bio : "Не указано"}
								</p>
							</div>
						</Card>
					</div>
				</motion.div>
			</If>
		</div>
	);
});

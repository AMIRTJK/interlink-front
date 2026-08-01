import { Camera } from "lucide-react";
import { IUser } from "@entities/login";
import userAvatar from "../../../../../assets/images/user-avatar.jpg";
import { orDash, resolvePhotoUrl } from "./profileInfoLib";
import { useProfileAvatarUpload } from "./useProfileAvatarUpload";

interface IProps {
	userData: IUser | null;
	onEdit: () => void;
	gradient: string;
}

export const ProfileAvatarCard = ({ userData, onEdit, gradient }: IProps) => {
	const {
		fileInputRef,
		avatarError,
		isUploading,
		handleAvatarClick,
		handleFileChange,
		handleAvatarError,
	} = useProfileAvatarUpload({
		photoUrl: userData?.photo_url,
		photoPath: userData?.photo_path,
	});

	return (
		<div className="bg-white/40! dark:bg-slate-800/90! backdrop-blur-3xl! p-6! rounded-[2.5rem]! border! border-white/20! dark:border-slate-700/50! shadow-sm! flex! flex-col! items-center!">
			<div className="relative! mb-4!">
				<button
					type="button"
					onClick={handleAvatarClick}
					aria-label="Изменить фото профиля"
					className={`group! relative! block! rounded-[2.5rem]! overflow-hidden! focus:outline-none! focus:ring-2! focus:ring-indigo-400/40! ${
						isUploading
							? "opacity-60! pointer-events-none!"
							: "cursor-pointer!"
					}`}
				>
					<img
						src={
							avatarError
								? userAvatar
								: userData?.photo_url ||
								  resolvePhotoUrl(userData?.photo_path) ||
								  userAvatar
						}
						alt="Аватар"
						className="w-64! h-64! rounded-[2.5rem]! border-2! border-white/60! dark:border-zinc-900/60! object-cover! shadow-lg!"
						onError={handleAvatarError}
					/>
					<span className="absolute! inset-0! bg-black/40! flex! flex-col! items-center! justify-center! gap-1! text-white! opacity-0! group-hover:opacity-100! transition-opacity!">
						<Camera size={26} />
						<span className="text-xs! font-semibold!">
							{isUploading ? "Загрузка…" : "Изменить фото"}
						</span>
					</span>
				</button>

				<input
					type="file"
					ref={fileInputRef}
					className="hidden!"
					accept="image/*"
					onChange={handleFileChange}
				/>
			</div>
			<h2 className="text-base! font-bold! text-zinc-900! dark:text-white! text-center!">
				{orDash(userData?.full_name)}
			</h2>
			<p className="text-xs! text-zinc-500! dark:text-zinc-400! mt-1!">
				{orDash(userData?.position)}
			</p>
			<p className="text-xs! text-zinc-500! dark:text-zinc-400!">
				{orDash(userData?.organization?.name)}
			</p>
			<button
				type="button"
				onClick={onEdit}
				className={`mt-5! w-full! bg-gradient-to-r! ${gradient} hover:opacity-90! text-white! py-2.5! rounded-[2.5rem]! text-sm! font-semibold! transition-all! shadow-md! border-0! cursor-pointer!`}
			>
				Настройки
			</button>
		</div>
	);
};

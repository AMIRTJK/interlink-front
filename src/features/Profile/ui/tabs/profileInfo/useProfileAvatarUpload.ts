import { useCallback, useEffect, useRef, useState } from "react";
import { ApiRoutes } from "@shared/api";
import { tokenControl } from "@shared/lib";
import { useMutationQuery } from "@shared/lib/hooks";
import { toast } from "@shared/lib/toast";
import { MAX_PHOTO_SIZE_MB } from "./profileInfoLib";

export const useProfileAvatarUpload = (photoDeps: {
	photoUrl?: string | null;
	photoPath?: string | null;
}) => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [avatarError, setAvatarError] = useState(false);

	useEffect(() => {
		setAvatarError(false);
	}, [photoDeps.photoUrl, photoDeps.photoPath]);

	const { mutate: uploadAvatar, isPending: isUploading } =
		useMutationQuery<FormData>({
			url: ApiRoutes.UPDATE_ME,
			method: "POST",
			messages: {
				success: "Фото профиля обновлено",
				error: "Ошибка при загрузке фото",
				invalidate: [
					ApiRoutes.AUTH_ME,
					`${ApiRoutes.FETCH_USER_BY_ID}${tokenControl.getUserId()}`,
				],
			},
		});

	const handleAvatarClick = useCallback(() => {
		fileInputRef.current?.click();
	}, []);

	const handleFileChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
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
		},
		[uploadAvatar],
	);

	const handleAvatarError = useCallback(() => setAvatarError(true), []);

	return {
		fileInputRef,
		avatarError,
		isUploading,
		handleAvatarClick,
		handleFileChange,
		handleAvatarError,
	};
};

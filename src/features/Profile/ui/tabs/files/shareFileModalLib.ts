import type { IFileUser } from "./lib";

export interface IShareData {
	id: number;
	shared_with_user_id?: number;
	user_id?: number;
	shared_with?: IFileUser;
	user?: IFileUser;
}

export const getShareName = (share: IShareData): string => {
	const targetUser = share.shared_with || share.user;
	return targetUser
		? targetUser.full_name ||
				`${targetUser.first_name || ""} ${targetUser.last_name || ""}`.trim()
		: `Пользователь #${share.shared_with_user_id || share.user_id}`;
};

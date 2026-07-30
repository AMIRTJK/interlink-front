import { useGetQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import type { IApiFile, IApiFolder } from "./lib";
import type { IShareData } from "./shareFileModalLib";

type TSharesResponse = {
	success: boolean;
	data: IShareData[] | { data: IShareData[] };
};

const extractShares = (response?: TSharesResponse): IShareData[] => {
	if (!response?.data) return [];
	if (Array.isArray(response.data)) return response.data;
	if (Array.isArray((response.data as any).data))
		return (response.data as any).data;
	return [];
};

export const useSharesQuery = (
	item: IApiFile | IApiFolder | null,
	type: "file" | "folder",
) => {
	const sharesQuery = useGetQuery<any, TSharesResponse>({
		url:
			item && type === "file"
				? ApiRoutes.MY_FILES_SHARES.replace(":id", String(item.id))
				: item && type === "folder"
					? ApiRoutes.MY_FILE_FOLDERS_SHARES.replace(":id", String(item.id))
					: "",
		useToken: true,
		options: {
			enabled: !!item,
			staleTime: 60 * 1000,
			refetchOnWindowFocus: false,
		},
	});

	return {
		activeShares: extractShares(sharesQuery.data),
		refetchShares: sharesQuery.refetch,
	};
};

import { useMemo } from "react";
import { IApiFile } from "./lib";
import {
	ISharesPagination,
	buildSharedFoldersData,
	buildSharedWithMeData,
} from "./filesSharesLib";
import { SharedWithMeCard } from "./SharedWithMeCard";
import { MySharesCard } from "./MySharesCard";

interface IProps {
	sharedWithMe?: IApiFile[];
	myFiles?: IApiFile[];
	pagination?: ISharesPagination;
	onPageChange?: (page: number) => void;
}

export const FilesUserShares = ({
	sharedWithMe = [],
	myFiles = [],
	pagination,
	onPageChange,
}: IProps) => {
	const sharedWithMeData = useMemo(
		() => buildSharedWithMeData(sharedWithMe),
		[sharedWithMe],
	);

	const iSharedData = useMemo(() => buildSharedFoldersData(myFiles), [myFiles]);

	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
			<SharedWithMeCard
				data={sharedWithMeData}
				pagination={pagination}
				onPageChange={onPageChange}
			/>
			<MySharesCard data={iSharedData} />
		</div>
	);
};

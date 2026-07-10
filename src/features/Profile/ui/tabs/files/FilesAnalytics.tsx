import { motion } from "framer-motion";
import { IApiFile, IDiskMeta } from "./lib";
import { FilesKpiCards } from "./FilesKpiCards";
import { FilesTypeChart } from "./FilesTypeChart";
import { FilesVolumeChart } from "./FilesVolumeChart";
import { FilesUserShares } from "./FilesUserShares";

interface IProps {
	sharedWithMe?: IApiFile[];
	myFiles?: IApiFile[];
	meta?: IDiskMeta | null;
	sharedFilesPagination?: {
		total: number;
		currentPage: number;
		perPage: number;
	};
	onPageChange?: (page: number) => void;
}

export const FilesAnalytics = ({
	sharedWithMe = [],
	myFiles = [],
	meta = null,
	sharedFilesPagination,
	onPageChange,
}: IProps) => {
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			className="flex flex-col gap-5 pb-6 animate-in fade-in slide-in-from-bottom-2 duration-300"
		>
			<FilesKpiCards meta={meta} sharedCount={sharedWithMe.length} />

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				<FilesTypeChart />
				<FilesVolumeChart />
			</div>

			<FilesUserShares
				sharedWithMe={sharedWithMe}
				myFiles={myFiles}
				pagination={sharedFilesPagination}
				onPageChange={onPageChange}
			/>
		</motion.div>
	);
};

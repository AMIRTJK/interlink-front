import { If } from "@shared/ui";
import type { IApiFile } from "./lib";

interface IProps {
	files: IApiFile[];
	selectedFileIds: number[];
	showSharedWith?: boolean;
	onSelectAll?: (ids: number[]) => void;
	onDeselectAll?: (ids: number[]) => void;
}

export const FileListHeader = ({
	files,
	selectedFileIds,
	showSharedWith,
	onSelectAll,
	onDeselectAll,
}: IProps) => {
	return (
		<thead>
			<tr className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 tracking-wider uppercase border-b border-slate-100 dark:border-slate-800">
				<If is={!!showSharedWith}>
					<th className="py-4 px-4 w-12 text-center">
						<input
							type="checkbox"
							checked={files.length > 0 && files.every((file) => selectedFileIds.includes(file.id))}
							onChange={(e) => {
								const fileIds = files.map((f) => f.id);
								if (e.target.checked) {
									onSelectAll?.(fileIds);
								} else {
									onDeselectAll?.(fileIds);
								}
							}}
							className="rounded border-slate-200 dark:border-slate-800 text-indigo-600 focus:ring-indigo-500/20 w-4 h-4 cursor-pointer"
						/>
					</th>
				</If>
				<th className="py-4 px-4">НАЗВАНИЕ</th>
				<th className="py-4 px-4 w-56">ВЛАДЕЛЕЦ</th>
				<If is={!!showSharedWith}>
					<th className="py-4 px-4 w-32">ДОСТУП</th>
				</If>
				<th className="py-4 px-4 w-36">ТИП</th>
				<th className="py-4 px-4 w-28">РАЗМЕР</th>
				<th className="py-4 px-4 w-36">ДАТА</th>
				<th className="py-4 px-4 w-48 text-right">ДЕЙСТВИЯ</th>
			</tr>
		</thead>
	);
};

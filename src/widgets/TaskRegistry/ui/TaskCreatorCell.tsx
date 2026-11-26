import { Tooltip } from "@shared/ui";
import type { Colleague } from "../model/types";
import { Avatar } from "./Avatar";

interface IProps {
	creator: Colleague | null;
}

export const TaskCreatorCell = ({ creator }: IProps) => {
	if (!creator) {
		return <span className="text-xs text-slate-400">—</span>;
	}

	return (
		<div className="flex items-center gap-2.5 min-w-0">
			<Avatar colleague={creator} className="w-8 h-8 text-xs font-bold shrink-0" />
			<div className="flex flex-col leading-tight min-w-0 flex-1">
				<Tooltip title={creator.name} placement="topLeft">
					<span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate block max-w-[170px] cursor-default">
						{creator.name}
					</span>
				</Tooltip>
				<Tooltip title={creator.role} placement="topLeft">
					<span className="text-[10px] text-slate-400 font-medium truncate block max-w-[170px] cursor-default">
						{creator.role || "—"}
					</span>
				</Tooltip>
			</div>
		</div>
	);
};

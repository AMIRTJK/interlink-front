interface IProps {
	label: string;
	icon: string;
}

export const FilesSharesEmptyBar = ({ label, icon }: IProps) => (
	<div className="flex flex-col items-center justify-center h-[180px] gap-3">
		<div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800/40 flex items-center justify-center text-xl shadow-sm border border-slate-100/50 dark:border-slate-800/20">
			{icon}
		</div>
		<p className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 text-center">
			{label}
		</p>
	</div>
);

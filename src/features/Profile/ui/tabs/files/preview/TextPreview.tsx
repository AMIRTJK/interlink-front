interface IProps {
	textContent: string;
}

export const TextPreview = ({ textContent }: IProps) => {
	return (
		<div className="w-full max-h-[70vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 p-6 bg-slate-50 dark:bg-slate-900/50 text-left">
			<pre className="file-preview-text text-slate-700 dark:text-zinc-300">
				{textContent}
			</pre>
		</div>
	);
};

interface IProps {
	htmlContent: string;
}

export const DocPreview = ({ htmlContent }: IProps) => {
	return (
		<div className="w-full max-h-[70vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 p-6 bg-white text-left">
			<div
				className="file-preview-paper doc-mode"
				dangerouslySetInnerHTML={{ __html: htmlContent }}
			/>
		</div>
	);
};

import { If } from "@shared/ui";
import { IExcelSheet } from "./types";

interface IProps {
	excelSheets: IExcelSheet[];
	activeSheetIndex: number;
	setActiveSheetIndex: (index: number) => void;
	htmlContent: string;
	setHtmlContent: (html: string) => void;
}

export const ExcelPreview = ({
	excelSheets,
	activeSheetIndex,
	setActiveSheetIndex,
	htmlContent,
	setHtmlContent,
}: IProps) => {
	const handleSheetSelect = (index: number, html: string) => {
		setActiveSheetIndex(index);
		setHtmlContent(html);
	};

	return (
		<div className="w-full max-h-[70vh] flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white text-left">
			<If is={excelSheets.length > 1}>
				<div className="flex items-center gap-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
					{excelSheets.map((sheet, idx) => (
						<button
							key={idx}
							type="button"
							onClick={() => handleSheetSelect(idx, sheet.html)}
							className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
								activeSheetIndex === idx
									? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm"
									: "text-slate-600 dark:text-zinc-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/50"
							}`}
						>
							{sheet.name}
						</button>
					))}
				</div>
			</If>
			<div className="p-6 overflow-auto max-h-[60vh]">
				<div
					className="file-preview-paper xls-mode"
					dangerouslySetInnerHTML={{ __html: htmlContent }}
				/>
			</div>
		</div>
	);
};

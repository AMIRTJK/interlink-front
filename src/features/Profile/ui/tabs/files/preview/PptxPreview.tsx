import { If } from "@shared/ui";
import { IPptxSlide } from "./types";

interface IProps {
	pptxSlides: IPptxSlide[];
	currentSlideIndex: number;
	setCurrentSlideIndex: React.Dispatch<React.SetStateAction<number>>;
	fileName: string;
}

export const PptxPreview = ({
	pptxSlides,
	currentSlideIndex,
	setCurrentSlideIndex,
	fileName,
}: IProps) => {
	const currentSlide = pptxSlides[currentSlideIndex];
	const hasTexts = Boolean(currentSlide?.texts && currentSlide.texts.length > 0);
	const isFirstSlide = currentSlideIndex === 0;
	const isLastSlide = currentSlideIndex === pptxSlides.length - 1;

	const handlePrevSlide = () => {
		setCurrentSlideIndex((prev) => Math.max(0, prev - 1));
	};

	const handleNextSlide = () => {
		setCurrentSlideIndex((prev) => Math.min(pptxSlides.length - 1, prev + 1));
	};

	return (
		<div className="w-full flex flex-col items-center gap-4">
			<div className="w-full max-w-[960px] aspect-[16/9] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-8 flex flex-col justify-between shadow-2xl border border-slate-700/60 relative overflow-hidden">
				<div className="flex items-center justify-between border-b border-slate-700/50 pb-4">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
							P
						</div>
						<h4 className="text-lg font-bold text-white tracking-wide truncate max-w-[600px]">
							{currentSlide?.title || fileName}
						</h4>
					</div>
					<span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-amber-400">
						Слайд {currentSlideIndex + 1} из {pptxSlides.length}
					</span>
				</div>

				<div className="flex-1 my-6 overflow-y-auto space-y-3 pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
					<If is={hasTexts}>
						{currentSlide?.texts.map((txt, idx) => (
							<div
								key={idx}
								className="flex items-start gap-3 text-sm text-slate-200"
							>
								<span className="w-2 h-2 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
								<p className="leading-relaxed">{txt}</p>
							</div>
						))}
					</If>
					<If is={!hasTexts}>
						<p className="text-sm text-slate-400 italic">
							Содержимое слайда отсутствует или является объектом.
						</p>
					</If>
				</div>

				<div className="flex items-center justify-between pt-3 border-t border-slate-700/50 text-[11px] text-slate-400">
					<span>{fileName}</span>
					<span>Презентация PowerPoint</span>
				</div>
			</div>

			<div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 shadow-md">
				<button
					type="button"
					onClick={handlePrevSlide}
					disabled={isFirstSlide}
					className="px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
				>
					◀ Предыдущий
				</button>

				<span className="text-xs font-bold text-slate-600 dark:text-zinc-300 px-2">
					{currentSlideIndex + 1} / {pptxSlides.length}
				</span>

				<button
					type="button"
					onClick={handleNextSlide}
					disabled={isLastSlide}
					className="px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
				>
					Следующий ▶
				</button>
			</div>
		</div>
	);
};

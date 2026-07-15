import { useEffect, useRef, useState } from "react";
import {
	ChevronLeft,
	ChevronRight,
	Calendar as CalendarIcon,
} from "lucide-react";
import { If } from "@shared/ui";
import {
	MONTHS,
	WEEKDAYS,
	getDaysInMonth,
	getFirstDayOfMonth,
	getInputClasses,
} from "../lib";

interface ICustomDatePickerProps {
	value?: string;
	onChange?: (v: string) => void;
	hasError?: boolean;
	disabled?: boolean;
}

export const CustomDatePicker = ({
	value,
	onChange,
	hasError,
	disabled,
}: ICustomDatePickerProps) => {
	const ref = useRef<HTMLDivElement>(null);
	const [open, setOpen] = useState(false);
	const [view, setView] = useState<"calendar" | "years">("calendar");

  const getSafeInitialDate = (val?: string) => {
    if (!val) return new Date();
    const d = new Date(val);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const initialDate = getSafeInitialDate(value);
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  const [yearPage, setYearPage] = useState(Math.floor(currentYear / 12) * 12);

	useEffect(() => {
		if (!value) return;
		const d = new Date(value);
		if (!isNaN(d.getTime())) {
			setCurrentYear(d.getFullYear());
			setCurrentMonth(d.getMonth());
		}
	}, [value]);

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setOpen(false);
				setView("calendar");
			}
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	const handlePrevMonth = () => {
		const isJan = currentMonth === 0;
		setCurrentMonth(isJan ? 11 : currentMonth - 1);
		if (isJan) setCurrentYear((y) => y - 1);
	};

	const handleNextMonth = () => {
		const isDec = currentMonth === 11;
		setCurrentMonth(isDec ? 0 : currentMonth + 1);
		if (isDec) setCurrentYear((y) => y + 1);
	};

	const handleSelectDay = (day: number) => {
		const mm = String(currentMonth + 1).padStart(2, "0");
		const dd = String(day).padStart(2, "0");
		onChange?.(`${currentYear}-${mm}-${dd}`);
		setOpen(false);
	};

	const handleSelectYear = (y: number) => {
		setCurrentYear(y);
		setView("calendar");
	};

  const parsedDate = value ? new Date(value) : null;
  const isValidDate = parsedDate !== null && !isNaN(parsedDate.getTime());
  const formattedValue = isValidDate && parsedDate ? parsedDate.toLocaleDateString("ru-RU") : "";
  const selectedDate = isValidDate ? parsedDate : null;

  const days = Array(getFirstDayOfMonth(currentYear, currentMonth)).fill(null)
    .concat(Array.from({ length: getDaysInMonth(currentYear, currentMonth) }, (_, i) => i + 1));

	const years = Array.from({ length: 12 }, (_, i) => yearPage + i);

	return (
		<div className="relative" ref={ref}>
			<button
				type="button"
				disabled={disabled}
				onClick={() => !disabled && setOpen((o) => !o)}
				className={`${getInputClasses(hasError, disabled)} h-11 pl-9 pr-3 flex items-center justify-between text-left cursor-pointer relative`}
			>
				<span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-slate-700 pointer-events-none flex">
					<CalendarIcon size={14} />
				</span>
				<span
					className={
						formattedValue
							? "text-gray-800 dark:text-slate-200"
							: "text-gray-400 dark:text-slate-600"
					}
				>
					{formattedValue || "Выберите дату"}
				</span>
			</button>

			<If is={open}>
				<div className="absolute z-20 mt-1 w-64 p-3.5 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl flex flex-col gap-2">
					<If is={view === "calendar"}>
						<div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800/80 pb-2">
							<button
								type="button"
								onClick={handlePrevMonth}
								className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 cursor-pointer"
							>
								<ChevronLeft size={16} />
							</button>
							<button
								type="button"
								onClick={() => {
									setView("years");
									setYearPage(Math.floor(currentYear / 12) * 12);
								}}
								className="text-xs font-bold text-gray-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 px-2 py-0.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer"
							>
								{MONTHS[currentMonth]} {currentYear}
							</button>
							<button
								type="button"
								onClick={handleNextMonth}
								className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 cursor-pointer"
							>
								<ChevronRight size={16} />
							</button>
						</div>

						<div className="grid grid-cols-7 gap-1 text-center">
							{WEEKDAYS.map((d) => (
								<span
									key={d}
									className="text-[10px] font-semibold text-gray-400 dark:text-slate-500 py-1"
								>
									{d}
								</span>
							))}

							{days.map((day, idx) => {
								// const isSel = selectedDate && selectedDate.getDate() === day && selectedDate.getMonth() === currentMonth && selectedDate.getFullYear() === currentYear;
								const isSel =
									day !== null &&
									selectedDate &&
									selectedDate.getDate() === day &&
									selectedDate.getMonth() === currentMonth &&
									selectedDate.getFullYear() === currentYear;
								return (
									<div
										key={idx}
										className="h-7 w-7 flex items-center justify-center m-auto"
									>
										<If is={day !== null}>
											<button
												type="button"
												onClick={() => handleSelectDay(day!)}
												className={`h-7 w-7 flex items-center justify-center rounded-lg text-xs font-semibold cursor-pointer ${
													isSel
														? "bg-indigo-600! text-white!"
														: "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
												}`}
											>
												{day}
											</button>
										</If>
									</div>
								);
							})}
						</div>
					</If>

					<If is={view === "years"}>
						<div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800/80 pb-2">
							<button
								type="button"
								onClick={() => setYearPage((p) => p - 12)}
								className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 cursor-pointer"
							>
								<ChevronLeft size={16} />
							</button>
							<span className="text-xs font-bold text-gray-800 dark:text-slate-200">
								Выбор года
							</span>
							<button
								type="button"
								onClick={() => setYearPage((p) => p + 12)}
								className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 cursor-pointer"
							>
								<ChevronRight size={16} />
							</button>
						</div>

						<div className="grid grid-cols-3 gap-2 py-1 text-center">
							{years.map((y) => {
								const isCurrent = y === currentYear;
								return (
									<button
										type="button"
										key={y}
										onClick={() => handleSelectYear(y)}
										className={`py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
											isCurrent
												? "bg-indigo-600! text-white!"
												: "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
										}`}
									>
										{y}
									</button>
								);
							})}
						</div>
					</If>
				</div>
			</If>
		</div>
	);
};

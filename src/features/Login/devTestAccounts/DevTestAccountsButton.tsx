import { FlaskConical } from "lucide-react";

interface IProps {
	onClick: () => void;
}

export const DevTestAccountsButton = ({ onClick }: IProps) => {
	return (
		<button
			type="button"
			onClick={onClick}
			className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 border border-blue-500/30 text-xs font-medium transition-all shadow-sm cursor-pointer hover:border-blue-400/50 active:scale-95"
		>
			<FlaskConical className="w-3.5 h-3.5" />
			<span>Тестовые логины</span>
			<span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
		</button>
	);
};

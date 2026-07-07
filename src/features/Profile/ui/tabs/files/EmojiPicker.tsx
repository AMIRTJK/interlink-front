interface IProps {
	selectedEmoji: string;
	onSelectEmoji: (emoji: string) => void;
}

const EMOJI_GROUPS = [
	{
		title: "ПАПКИ И ФАЙЛЫ",
		icon: "📁",
		emojis: ["📁", "📂", "🗂️", "📥", "📤", "📎", "📝", "📋", "🗃️", "🗄️"],
	},
	{
		title: "РАБОТА И IT",
		icon: "💼",
		emojis: ["💼", "💻", "🖥️", "⚙️", "🔧", "🛡️", "🔒", "🔑", "📡", "🖨️"],
	},
	{
		title: "АНАЛИТИКА И МЕДИА",
		icon: "📊",
		emojis: ["📊", "📈", "📉", "💡", "🔍", "🎨", "📷", "🎥", "🎞️", "🖼️"],
	},
	{
		title: "РАЗНОЕ",
		icon: "⭐",
		emojis: ["⭐", "💖", "🔥", "☀️", "⚡", "🎉", "🚩", "🌍", "🏆", "🎯"],
	},
];

export const EmojiPicker = ({ selectedEmoji, onSelectEmoji }: IProps) => {
	return (
		<div className="space-y-5">
			{EMOJI_GROUPS.map((group) => (
				<div key={group.title} className="space-y-2.5">
					<div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-zinc-500 tracking-wider">
						<span className="text-sm">{group.icon}</span>
						<span>{group.title}</span>
					</div>
					<div className="grid grid-cols-10 gap-0.5">
						{group.emojis.map((emoji) => {
							const isSelected = selectedEmoji === emoji;
							return (
								<button
									key={emoji}
									type="button"
									onClick={() => onSelectEmoji(emoji)}
									className={`w-10 h-10 flex! items-center! justify-center! text-2xl rounded-xl transition-all hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer ${
										isSelected
											? "border-2 border-indigo-500! bg-indigo-50 dark:bg-indigo-950/20"
											: "border-2 border-transparent"
									}`}
								>
									{emoji}
								</button>
							);
						})}
					</div>
				</div>
			))}
		</div>
	);
};

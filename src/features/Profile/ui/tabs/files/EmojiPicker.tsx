import React from "react";

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
		<div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
			{EMOJI_GROUPS.map((group) => (
				<div key={group.title} className="space-y-2">
					<div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-zinc-550">
						<span>{group.icon}</span>
						<span>{group.title}</span>
					</div>
					<div className="grid grid-cols-10 justify-items-center">
						{group.emojis.map((emoji) => {
							const isSelected = selectedEmoji === emoji;
							return (
								<button
									key={emoji}
									type="button"
									onClick={() => onSelectEmoji(emoji)}
									className={`w-9 h-9 flex! items-center! justify-center! text-lg rounded-xl transition-all hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer ${
										isSelected
											? "border-2 border-indigo-500! bg-indigo-50/50 dark:bg-indigo-950/20"
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


import { memo } from "react";
import { NOT_SET } from "./profileInfoLib";

interface IInfoRowProps {
	icon: React.ReactNode;
	label: string;
	value: string;
}

export const InfoRow = memo(({ icon, label, value }: IInfoRowProps) => (
	<div className="flex! items-start! gap-3!">
		<span className="text-zinc-400! mt-0.5! shrink-0!">{icon}</span>
		<div className="min-w-0!">
			<span className="block! text-[10px]! font-bold! text-zinc-400! uppercase! tracking-wider!">
				{label}
			</span>
			<span
				className={`text-sm! font-medium! break-words! ${
					value === NOT_SET
						? "text-zinc-400! dark:text-zinc-500! italic!"
						: "text-zinc-800! dark:text-zinc-200!"
				}`}
			>
				{value}
			</span>
		</div>
	</div>
));

export const Card = memo(({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) => (
	<div className="bg-white/40! dark:bg-slate-800/90! backdrop-blur-3xl! p-6! rounded-[2.5rem]! border! border-white/20! dark:border-slate-700/50! shadow-sm!">
		<h3 className="text-xs! font-bold! text-zinc-400! dark:text-zinc-500! uppercase! tracking-wider! mb-4!">
			{title}
		</h3>
		<div className="grid! grid-cols-1! md:grid-cols-2! gap-5!">{children}</div>
	</div>
));

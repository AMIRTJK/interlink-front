import { Fingerprint } from "lucide-react";

export const LoginAltActions = () => (
	<>
		<div className="flex items-center my-8 gap-4">
			<div className="flex-grow border-t border-white/10"></div>
			<span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
				Или войдите через
			</span>
			<div className="flex-grow border-t border-white/10"></div>
		</div>

		<div className="grid grid-cols-3 gap-3">
			{/* Социальные кнопки (оставлены без изменений) */}
			<button
				type="button"
				className="flex justify-center items-center py-2.5 rounded-xl bg-slate-900/50 border border-white/10 hover:bg-slate-800/80 transition-colors group"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors"
				>
					<path d="M10.88 21.94 15.46 14"></path>
					<path d="M21.17 8H12"></path>
					<path d="M3.95 6.06 8.54 14"></path>
					<circle cx="12" cy="12" r="10"></circle>
					<circle cx="12" cy="12" r="4"></circle>
				</svg>
			</button>
			<button
				type="button"
				className="flex justify-center items-center py-2.5 rounded-xl bg-slate-900/50 border border-white/10 hover:bg-slate-800/80 transition-colors group"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors"
				>
					<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
					<path d="M9 18c-4.51 2-5-2-7-2"></path>
				</svg>
			</button>
			<button
				type="button"
				className="flex justify-center items-center py-2.5 rounded-xl bg-slate-900/50 border border-white/10 hover:bg-slate-800/80 transition-colors group"
			>
				<Fingerprint className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
			</button>
		</div>

		<div className="mt-8 text-center">
			<p className="text-slate-400 text-sm">
				Нет аккаунта?{" "}
				<button
					type="button"
					className="text-white cursor-pointer font-semibold hover:text-blue-400! transition-colors ml-1"
				>
					Регистрация
				</button>
			</p>
		</div>
	</>
);

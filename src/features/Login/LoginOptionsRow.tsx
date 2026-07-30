export const LoginOptionsRow = () => (
	<div className="flex items-center justify-between mt-4">
		<label className="flex items-center gap-3 cursor-pointer group">
			<div className="relative flex items-center justify-center w-5 h-5 rounded-md border border-white/20 bg-slate-900/50 group-hover:border-blue-500/50 transition-colors overflow-hidden">
				<input
					type="checkbox"
					className="peer absolute inset-0 opacity-0 cursor-pointer z-10"
				/>
				<div className="absolute inset-0 bg-blue-500 opacity-0 peer-checked:opacity-100 transition-opacity"></div>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity z-10"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="3"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<polyline points="20 6 9 17 4 12"></polyline>
				</svg>
			</div>
			<span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors select-none">
				Запомнить меня
			</span>
		</label>
		<button
			type="button"
			className="text-sm text-blue-400 cursor-pointer hover:text-blue-300 font-medium transition-colors"
		>
			Забыли пароль?
		</button>
	</div>
);

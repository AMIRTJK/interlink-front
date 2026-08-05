import React from "react";
import { Smartphone } from "lucide-react";
import { OTP_LENGTH } from "./loginModel";

interface IProps {
	otp: string[];
	otpRefs: React.RefObject<(HTMLInputElement | null)[]>;
	isVerifying: boolean;
	onOtpChange: (index: number, value: string) => void;
	onOtpKeyDown: (
		index: number,
		e: React.KeyboardEvent<HTMLInputElement>,
	) => void;
	onSubmit: (e: React.FormEvent) => void;
	onBack: () => void;
}

export const VerificationStep = ({
	otp,
	otpRefs,
	isVerifying,
	onOtpChange,
	onOtpKeyDown,
	onSubmit,
	onBack,
}: IProps) => (
	<div className="text-center space-y-6 pt-4">
		<div className="flex justify-center">
			<div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
				<Smartphone className="w-6 h-6 text-blue-500" />
			</div>
		</div>

		<div>
			<h3 className="text-2xl font-bold text-white">
				Двухфакторная аутентификация
			</h3>
			<p className="text-slate-400 text-sm mt-2">
				Введите 6-значный код из приложения-аутентификатора.
			</p>
		</div>

		<form onSubmit={onSubmit} className="space-y-6">
			<div className="flex justify-center gap-2">
				{otp.map((digit, index) => (
					<input
						key={index}
						ref={(el) => {
							otpRefs.current[index] = el;
						}}
						type="text"
						inputMode="numeric"
						maxLength={1}
						value={digit}
						onChange={(e) => onOtpChange(index, e.target.value)}
						onKeyDown={(e) => onOtpKeyDown(index, e)}
						className="w-10 h-12 sm:w-11 sm:h-14 bg-slate-900/25 border border-white/15 rounded-xl text-center text-xl font-bold text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-inner"
					/>
				))}
			</div>

			<button
				type="submit"
				disabled={otp.join("").length !== OTP_LENGTH || isVerifying}
				className="w-full h-12 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold rounded-xl transition-all active:scale-[0.98]"
			>
				{isVerifying ? "Проверка..." : "Подтвердить вход"}
			</button>
		</form>

		<div className="pt-4 flex flex-col gap-4 items-center">
			<p className="text-sm text-slate-500">
				Откройте приложение (Google Authenticator, Microsoft Authenticator) и
				введите текущий код.
			</p>

			<button
				type="button"
				onClick={onBack}
				className="text-xs text-slate-500 hover:text-white transition-colors underline underline-offset-2"
			>
				Изменить номер телефона
			</button>
		</div>
	</div>
);

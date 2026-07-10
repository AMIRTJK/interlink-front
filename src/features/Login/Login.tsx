import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Select, Input, ConfigProvider } from "antd";
import {
	ChevronDown,
	Phone,
	Lock,
	Eye,
	EyeOff,
	ArrowRight,
	Fingerprint,
	Smartphone,
} from "lucide-react";

import { toast } from "@shared/lib/toast";

import { AppRoutes } from "@shared/config";
import { ApiRoutes } from "@shared/api";
import { tokenControl, useMutationQuery } from "@shared/lib";
import {
	ILoginRequest,
	ILoginResponse,
	IMfaVerifyRequest,
	IMfaVerifyResponse,
} from "@entities/login";

type AuthStep = "login" | "verification";

export const Login = () => {
	const navigate = useNavigate();
	const [step, setStep] = useState<AuthStep>("login");
	const [showPassword, setShowPassword] = useState(false);

	// Состояния для формы
	const [prefix, setPrefix] = useState("+992");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [password, setPassword] = useState("");

	const phoneLengths: Record<string, number> = {
		"+992": 9,
		"+7": 10,
	};

	const normalizePhoneNumber = (value: string, countryPrefix: string) => {
		const digits = value.replace(/\D/g, "");
		const maxLength = phoneLengths[countryPrefix] ?? 9;
		return digits.slice(0, maxLength);
	};

	const handlePrefixChange = (value: string) => {
		setPrefix(value);
		setPhoneNumber((current) => normalizePhoneNumber(current, value));
	};

	const handlePhoneNumberChange = (value: string) => {
		setPhoneNumber(normalizePhoneNumber(value, prefix));
	};

	const [otp, setOtp] = useState(["", "", "", "", "", ""]);
	const [mfaToken, setMfaToken] = useState("");
	const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

	const resetOtp = () => {
		setOtp(["", "", "", "", "", ""]);
		otpRefs.current[0]?.focus();
	};

	const finishLogin = (token: string, userId?: number) => {
		tokenControl.set({ token });
		if (userId) tokenControl.setUserId(userId);
		toast.success("Вход выполнен");
		navigate(AppRoutes.PROFILE, { replace: true });
	};

	// Шаг 1: вход по номеру телефона и паролю
	const { mutate: login, isPending: isLoggingIn } = useMutationQuery<
		ILoginRequest,
		ILoginResponse
	>({
		url: ApiRoutes.LOGIN,
		method: "POST",
		skipAuth: true,
		messages: {
			suppressSuccessToast: true,
			onSuccessCb: (data: ILoginResponse) => {
				// Вариант A: MFA выключен — токен пришел сразу, вход завершен
				if (data?.token) {
					finishLogin(data.token, data.user?.id);
					return;
				}
				// Вариант B: MFA включен — переходим на шаг ввода кода
				if (data?.mfa_required && data?.mfa_token) {
					setMfaToken(data.mfa_token);
					resetOtp();
					setStep("verification");
				}
			},
		},
	});

	// Шаг 2: подтверждение 6-значного кода из приложения-аутентификатора
	const { mutate: verifyMfa, isPending: isVerifying } = useMutationQuery<
		IMfaVerifyRequest,
		IMfaVerifyResponse
	>({
		url: ApiRoutes.MFA_VERIFY,
		method: "POST",
		skipAuth: true,
		messages: {
			suppressSuccessToast: true,
			onSuccessCb: (data: IMfaVerifyResponse) => {
				finishLogin(data.token, data.user?.id);
			},
			// Неверный/просроченный код — очищаем поле для повторного ввода
			onErrorCb: resetOtp,
		},
	});

	const handleLoginSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const fullPhone = `${prefix}${phoneNumber}`;
		login({ phone: fullPhone, password });
	};

	const handleVerifySubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const code = otp.join("");
		if (code.length === 6 && mfaToken) {
			verifyMfa({ mfa_token: mfaToken, code });
		}
	};

	const handleOtpChange = (index: number, value: string) => {
		if (!/^\d*$/.test(value)) return;
		const newOtp = [...otp];
		newOtp[index] = value;
		setOtp(newOtp);

		if (value !== "" && index < 5) {
			otpRefs.current[index + 1]?.focus();
		}
	};

	const handleOtpKeyDown = (
		index: number,
		e: React.KeyboardEvent<HTMLInputElement>,
	) => {
		if (e.key === "Backspace" && otp[index] === "" && index > 0) {
			otpRefs.current[index - 1]?.focus();
		}
	};

	return (
		<ConfigProvider
			theme={{
				token: {
					colorPrimary: "#3b82f6",
					colorBgContainer: "rgba(15, 23, 42, 0.5)",
					colorBorder: "rgba(255, 255, 255, 0.1)",
					colorText: "#ffffff",
					colorTextPlaceholder: "#64748b",
					colorIcon: "#64748b",
					colorBgElevated: "#0f172a",
					borderRadius: 12,
					controlHeight: 48,
					fontFamily: "inherit",
					controlOutline: "rgba(59, 130, 246, 0.2)",
				},
				components: {
					Select: {
						optionSelectedBg: "rgba(59, 130, 246, 0.2)",
						optionActiveBg: "rgba(255, 255, 255, 0.05)",
						selectorBg: "rgba(15, 23, 42, 0.5)",
					},
					Input: {
						activeBg: "rgba(15, 23, 42, 1)",
						hoverBg: "rgba(15, 23, 42, 0.5)",
					},
				},
			}}
		>
			<div className="relative overflow-hidden w-full transition-all duration-300">
				{/* --- ЭКРАН 1: ЛОГИН --- */}
				<div
					className={`transition-all duration-500 ease-in-out ${
						step === "login"
							? "opacity-100 translate-x-0 relative z-10"
							: "opacity-0 -translate-x-full absolute inset-0 pointer-events-none z-0"
					}`}
				>
					<form className="space-y-5" onSubmit={handleLoginSubmit}>
						<div className="space-y-3">
							<label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">
								Номер телефона
							</label>
							<div className="flex gap-2 mt-1.5">
								<Select
									value={prefix}
									onChange={handlePrefixChange}
									suffixIcon={
										<ChevronDown className="w-4 h-4 text-slate-500" />
									}
									style={{ width: 120 }}
									popupMatchSelectWidth={false}
									classNames={{
										popup: {
											root: "[&_.ant-select-item]:mb-1 [&_.ant-select-item:last-child]:mb-0 [&_.ant-select-item]:rounded-lg",
										},
									}}
									options={[
										{
											value: "+992",
											label: (
												<div className="flex items-center gap-3">
													<span className="text-base">🇹🇯</span>
													<span className="font-medium text-slate-200">
														+992
													</span>
												</div>
											),
										},
										{
											value: "+7",
											label: (
												<div className="flex items-center gap-3">
													<span className="text-base">🇷🇺</span>
													<span className="font-medium text-slate-200">+7</span>
												</div>
											),
										},
									]}
								/>
								<Input
									type="tel"
									name="phone"
									autoComplete="tel"
									required
									placeholder={prefix === "+7" ? "000 000 0000" : "00 000 0000"}
									maxLength={phoneLengths[prefix]}
									value={phoneNumber}
									onChange={(e) => handlePhoneNumberChange(e.target.value)}
									prefix={<Phone className="w-5 h-5 text-slate-500 mr-2" />}
									className="flex-1"
								/>
							</div>
						</div>

						<div className="space-y-3">
							<label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">
								Пароль
							</label>
							<Input
								className="mt-1.5!"
								type={showPassword ? "text" : "password"}
								required
								placeholder="••••••••"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								prefix={<Lock className="w-5 h-5 text-slate-500 mr-2" />}
								suffix={
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="text-slate-500 hover:text-white transition-colors flex items-center justify-center cursor-pointer"
									>
										{showPassword ? (
											<EyeOff className="w-5 h-5" />
										) : (
											<Eye className="w-5 h-5" />
										)}
									</button>
								}
							/>
						</div>

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

						<button
							type="submit"
							disabled={isLoggingIn}
							className="w-full cursor-pointer relative group h-12 mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
						>
							<div className="flex items-center justify-center gap-2">
								{isLoggingIn ? (
									"Вход..."
								) : (
									<>
										Продолжить
										<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
									</>
								)}
							</div>
						</button>

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
					</form>
				</div>

				{/* --- ЭКРАН 2: ПРОВЕРКА КОДА (SECURITY CHECK) --- */}
				<div
					className={`transition-all duration-500 ease-in-out ${
						step === "verification"
							? "opacity-100 translate-x-0 relative z-10"
							: "opacity-0 translate-x-full absolute inset-0 pointer-events-none z-0"
					}`}
				>
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

						<form onSubmit={handleVerifySubmit} className="space-y-6">
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
										onChange={(e) => handleOtpChange(index, e.target.value)}
										onKeyDown={(e) => handleOtpKeyDown(index, e)}
										className="w-10 h-12 sm:w-11 sm:h-14 bg-slate-900/50 border border-white/10 rounded-xl text-center text-xl font-bold text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-inner"
									/>
								))}
							</div>

							<button
								type="submit"
								disabled={otp.join("").length !== 6 || isVerifying}
								className="w-full h-12 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold rounded-xl transition-all active:scale-[0.98]"
							>
								{isVerifying ? "Проверка..." : "Подтвердить вход"}
							</button>
						</form>

						<div className="pt-4 flex flex-col gap-4 items-center">
							<p className="text-sm text-slate-500">
								Откройте приложение (Google Authenticator, Microsoft
								Authenticator) и введите текущий код.
							</p>

							<button
								type="button"
								onClick={() => setStep("login")}
								className="text-xs text-slate-500 hover:text-white transition-colors underline underline-offset-2"
							>
								Изменить номер телефона
							</button>
						</div>
					</div>
				</div>
			</div>
		</ConfigProvider>
	);
};

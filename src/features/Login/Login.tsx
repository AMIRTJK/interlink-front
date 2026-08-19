import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ConfigProvider } from "antd";

import { toast } from "@shared/lib/toast";

import { AppRoutes, welcomeStorage } from "@shared/config";
import { ApiRoutes } from "@shared/api";
import { tokenControl, useMutationQuery } from "@shared/lib";
import {
	ILoginRequest,
	ILoginResponse,
	IMfaVerifyRequest,
	IMfaVerifyResponse,
} from "@entities/login";
import { LOGIN_ANTD_THEME, OTP_LENGTH, type TAuthStep } from "./loginModel";
import { createEmptyOtp, normalizePhoneNumber } from "./loginLib";
import { LoginStep } from "./LoginStep";
import { VerificationStep } from "./VerificationStep";
import { DevTestAccountsModal, extractTestPhoneLocal } from "./devTestAccounts";

export const Login = () => {
	const navigate = useNavigate();
	const [step, setStep] = useState<TAuthStep>("login");
	const [showPassword, setShowPassword] = useState(false);

	// Состояния для формы
	const [prefix, setPrefix] = useState("+992");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [password, setPassword] = useState("");
	const [isTestAccountsModalOpen, setIsTestAccountsModalOpen] = useState(false);

	const handlePrefixChange = (value: string) => {
		setPrefix(value);
		setPhoneNumber((current) => normalizePhoneNumber(current, value));
	};

	const handlePhoneNumberChange = (value: string) => {
		setPhoneNumber(normalizePhoneNumber(value, prefix));
	};

	const handleSelectTestAccount = (phone: string) => {
		const localPhone = extractTestPhoneLocal(phone);
		setPrefix("+992");
		setPhoneNumber(normalizePhoneNumber(localPhone, "+992"));
		toast.info(`Подставлен тестовый номер: ${localPhone}`);
	};

	const [otp, setOtp] = useState(createEmptyOtp);
	const [mfaToken, setMfaToken] = useState("");
	const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

	const resetOtp = () => {
		setOtp(createEmptyOtp());
		otpRefs.current[0]?.focus();
	};

	const finishLogin = (token: string, userId?: number) => {
		tokenControl.set({ token });
		if (userId) tokenControl.setUserId(userId);
		toast.success("Вход выполнен");

		if (welcomeStorage.shouldShow()) {
			welcomeStorage.markPending();
			navigate(AppRoutes.AUTH_WELCOME, {
				replace: true,
				state: { to: AppRoutes.PROFILE },
			});
			return;
		}

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
		if (code.length === OTP_LENGTH && mfaToken) {
			verifyMfa({ mfa_token: mfaToken, code });
		}
	};

	const handleOtpChange = (index: number, value: string) => {
		if (!/^\d*$/.test(value)) return;
		const newOtp = [...otp];
		newOtp[index] = value;
		setOtp(newOtp);

		if (value !== "" && index < OTP_LENGTH - 1) {
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
		<ConfigProvider theme={LOGIN_ANTD_THEME}>
			<div className="relative overflow-hidden w-full transition-all duration-300">
				{/* --- ЭКРАН 1: ЛОГИН --- */}
				<div
					className={`transition-all duration-500 ease-in-out ${
						step === "login"
							? "opacity-100 translate-x-0 relative z-10"
							: "opacity-0 -translate-x-full absolute inset-0 pointer-events-none z-0"
					}`}
				>
					<LoginStep
						prefix={prefix}
						phoneNumber={phoneNumber}
						password={password}
						showPassword={showPassword}
						isLoggingIn={isLoggingIn}
						onPrefixChange={handlePrefixChange}
						onPhoneNumberChange={handlePhoneNumberChange}
						onPasswordChange={setPassword}
						onToggleShowPassword={() => setShowPassword(!showPassword)}
						onOpenTestAccounts={() => setIsTestAccountsModalOpen(true)}
						onSubmit={handleLoginSubmit}
					/>
				</div>

				{/* --- ЭКРАН 2: ПРОВЕРКА КОДА (SECURITY CHECK) --- */}
				<div
					className={`transition-all duration-500 ease-in-out ${
						step === "verification"
							? "opacity-100 translate-x-0 relative z-10"
							: "opacity-0 translate-x-full absolute inset-0 pointer-events-none z-0"
					}`}
				>
					<VerificationStep
						otp={otp}
						otpRefs={otpRefs}
						isVerifying={isVerifying}
						onOtpChange={handleOtpChange}
						onOtpKeyDown={handleOtpKeyDown}
						onSubmit={handleVerifySubmit}
						onBack={() => setStep("login")}
					/>
				</div>
			</div>

			<DevTestAccountsModal
				isOpen={isTestAccountsModalOpen}
				onClose={() => setIsTestAccountsModalOpen(false)}
				onSelectAccount={handleSelectTestAccount}
			/>
		</ConfigProvider>
	);
};

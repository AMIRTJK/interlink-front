import React from "react";
import { ArrowRight } from "lucide-react";
import { PhoneField } from "./PhoneField";
import { PasswordField } from "./PasswordField";
import { LoginOptionsRow } from "./LoginOptionsRow";
import { DevTestAccountsButton } from "./devTestAccounts";

interface IProps {
	prefix: string;
	phoneNumber: string;
	password: string;
	showPassword: boolean;
	isLoggingIn: boolean;
	onPrefixChange: (value: string) => void;
	onPhoneNumberChange: (value: string) => void;
	onPasswordChange: (value: string) => void;
	onToggleShowPassword: () => void;
	onOpenTestAccounts: () => void;
	onSubmit: (e: React.FormEvent) => void;
}

export const LoginStep = ({
	prefix,
	phoneNumber,
	password,
	showPassword,
	isLoggingIn,
	onPrefixChange,
	onPhoneNumberChange,
	onPasswordChange,
	onToggleShowPassword,
	onOpenTestAccounts,
	onSubmit,
}: IProps) => (
	<form className="space-y-5" onSubmit={onSubmit}>
		<div className="flex items-center justify-between pb-0.5">
			<span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
				Вход в систему
			</span>
			<DevTestAccountsButton onClick={onOpenTestAccounts} />
		</div>

		<PhoneField
			prefix={prefix}
			phoneNumber={phoneNumber}
			onPrefixChange={onPrefixChange}
			onPhoneNumberChange={onPhoneNumberChange}
		/>

		<PasswordField
			password={password}
			showPassword={showPassword}
			onPasswordChange={onPasswordChange}
			onToggleShowPassword={onToggleShowPassword}
		/>

		<LoginOptionsRow />

		<button
			type="submit"
			disabled={isLoggingIn}
			className="w-full cursor-pointer relative group h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
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
	</form>
);

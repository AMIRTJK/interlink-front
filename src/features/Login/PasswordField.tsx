import { Input } from "antd";
import { Lock, Eye, EyeOff } from "lucide-react";

interface IProps {
	password: string;
	showPassword: boolean;
	onPasswordChange: (value: string) => void;
	onToggleShowPassword: () => void;
}

export const PasswordField = ({
	password,
	showPassword,
	onPasswordChange,
	onToggleShowPassword,
}: IProps) => (
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
			onChange={(e) => onPasswordChange(e.target.value)}
			prefix={<Lock className="w-5 h-5 text-slate-500 mr-2" />}
			suffix={
				<button
					type="button"
					onClick={onToggleShowPassword}
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
);

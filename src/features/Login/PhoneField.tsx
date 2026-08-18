import { Select, Input } from "antd";
import { ChevronDown, Phone } from "lucide-react";
import { PHONE_LENGTHS } from "./loginModel";

interface IProps {
	prefix: string;
	phoneNumber: string;
	onPrefixChange: (value: string) => void;
	onPhoneNumberChange: (value: string) => void;
}

const PREFIX_OPTIONS = [
	{
		value: "+992",
		label: (
			<div className="flex items-center gap-3">
				<span className="text-base">🇹🇯</span>
				<span className="font-medium text-slate-200">+992</span>
			</div>
		),
	},
];

export const PhoneField = ({
	prefix,
	phoneNumber,
	onPrefixChange,
	onPhoneNumberChange,
}: IProps) => (
	<div className="space-y-3">
		<label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">
			Номер телефона
		</label>
		<div className="flex gap-2 mt-1.5">
			<Select
				value={prefix}
				onChange={onPrefixChange}
				suffixIcon={<ChevronDown className="w-4 h-4 text-slate-500" />}
				style={{ width: 120 }}
				popupMatchSelectWidth={false}
				classNames={{
					popup: {
						root: "[&_.ant-select-item]:mb-1 [&_.ant-select-item:last-child]:mb-0 [&_.ant-select-item]:rounded-lg",
					},
				}}
				options={PREFIX_OPTIONS}
			/>
			<Input
				type="tel"
				name="phone"
				autoComplete="tel"
				required
				placeholder="00 000 0000"
				maxLength={PHONE_LENGTHS[prefix]}
				value={phoneNumber}
				onChange={(e) => onPhoneNumberChange(e.target.value)}
				prefix={<Phone className="w-5 h-5 text-slate-500 mr-2" />}
				className="flex-1"
			/>
		</div>
	</div>
);

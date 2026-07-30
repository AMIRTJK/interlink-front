import type { ThemeConfig } from "antd";

export type TAuthStep = "login" | "verification";

export const OTP_LENGTH = 6;

export const DEFAULT_PHONE_LENGTH = 9;

export const PHONE_LENGTHS: Record<string, number> = {
	"+992": 9,
	"+7": 10,
};

export const LOGIN_ANTD_THEME: ThemeConfig = {
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
};

import { DEFAULT_PHONE_LENGTH, OTP_LENGTH, PHONE_LENGTHS } from "./loginModel";

export const createEmptyOtp = () => Array<string>(OTP_LENGTH).fill("");

export const normalizePhoneNumber = (
	value: string,
	countryPrefix: string,
) => {
	const digits = value.replace(/\D/g, "");
	const maxLength = PHONE_LENGTHS[countryPrefix] ?? DEFAULT_PHONE_LENGTH;
	return digits.slice(0, maxLength);
};

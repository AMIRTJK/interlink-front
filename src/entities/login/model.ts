import type { IPassportOcrData } from "@entities/hr";

export interface ILoginRequest {
	phone: string;
	password: string;
}

export interface IUser {
	id: number;
	last_name: string;
	first_name: string;
	middle_name: string | null;
	phone: string;
	position: string;
	mfa_enabled?: boolean;
	organization_id?: number | string;
	inn?: string;
	birth_date?: string | null;
	gender?: string | null;
	address?: string | null;
	// Паспортные и OCR-данные — теперь доступны в GET /api/v1/auth/me
	passport_series?: string | null;
	passport_number?: string | null;
	passport_front_path?: string | null;
	passport_back_path?: string | null;
	passport_ocr_scanned_at?: string | null;
	passport_ocr_data?: IPassportOcrData | null;
	photo_path: string | null;
	phone_verified_at: string | null;
	meta: null;
	created_at: string;
	updated_at: string;
	full_name: string;
	roles: string[];
	personal_email: string | null;
	bio?: string | null;
	/** Права, выданные пользователю напрямую, в обход ролей */
	direct_permissions?: string[];
	/** Персональные исключения — права роли, отключённые лично этому пользователю */
	denied_permissions?: string[];
	/** Итоговый effective-список: role permissions + direct - denied (считает backend) */
	permissions: string[];
	organization: {
		id: number;
		name: string;
		short_name: string;
	};
	departments: string[];
}

/**
 * Тело запроса PATCH /api/v1/auth/me — частичное обновление собственного профиля.
 * Помимо базовых полей теперь принимает паспортные/OCR-поля (см. IUser).
 */
export interface IUpdateMeDTO {
	last_name?: string;
	first_name?: string;
	middle_name?: string | null;
	personal_email?: string | null;
	personal_phone?: string | null;
	birth_date?: string | null;
	gender?: string | null;
	address?: string | null;
	inn?: string | null;
	bio?: string | null;
	passport_series?: string | null;
	passport_number?: string | null;
	passport_front_path?: string | null;
	passport_back_path?: string | null;
	passport_ocr_scanned_at?: string | null;
	passport_ocr_data?: IPassportOcrData | null;
}

/**
 * Ответ на /auth/login.
 * Вариант A (MFA выключен): приходит { user, token }.
 * Вариант B (MFA включен): приходит challenge { mfa_required, mfa_token, expires_at }.
 */
export interface ILoginResponse {
	// Вариант A — обычный вход
	user?: IUser;
	token?: string;
	// Вариант B — требуется подтверждение MFA
	mfa_required?: boolean;
	mfa_token?: string;
	expires_at?: string;
}

/** Тело запроса подтверждения MFA при входе (/auth/mfa/verify). */
export interface IMfaVerifyRequest {
	mfa_token: string;
	code: string;
}

/** Успешный ответ /auth/mfa/verify — обычный вход с токеном. */
export interface IMfaVerifyResponse {
	user: IUser;
	token: string;
}

/** Ответ /auth/mfa/setup — данные для построения QR и ручного ввода. */
export interface IMfaSetupResponse {
	mfa_enabled: boolean;
	secret: string;
	issuer: string;
	account_name: string;
	otpauth_url: string;
}

/** Тело запроса для /auth/mfa/confirm и /auth/mfa/disable. */
export interface IMfaCodeRequest {
	code: string;
}

/** Ответ /auth/mfa/confirm и /auth/mfa/disable. */
export interface IMfaStatusResponse {
	mfa_enabled: boolean;
}

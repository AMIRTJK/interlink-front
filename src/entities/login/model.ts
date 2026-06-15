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
  photo_path: string | null;
  phone_verified_at: string | null;
  meta: null;
  created_at: string;
  updated_at: string;
  full_name: string;
  roles: string[];
  permissions: string[];
  organization: {
    id: number;
    name: string;
    short_name: string;
    
},
departments:string[]
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

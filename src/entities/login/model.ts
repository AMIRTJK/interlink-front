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
  photo_path: string | null;
  phone_verified_at: string | null;
  meta: null;
  created_at: string;
  updated_at: string;
  full_name: string;
  roles: string[];
  permissions: string[];
}

export interface ILoginResponse {
  user: IUser;
  token: string;
}

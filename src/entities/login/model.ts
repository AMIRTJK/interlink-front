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
    
}

export interface ILoginResponse {
  user: IUser;
  token: string;
}

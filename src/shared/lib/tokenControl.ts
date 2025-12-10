const ACCESS_TOKEN_KEY = "smtp/accessToken";
const ACCESS_TOKEN_EXPIRE_KEY = "smtp/accessTokenExpire";
const REFRESH_TOKEN_KEY = "smtp/refreshToken";
const USER_ID = "smtp/userId";
const ROLE_ID = "smtp/roleId";

interface IToken {
  accessToken: string;
  refreshToken?: string;
  expireTime?: number;
}

export const tokenControl = {
  set: ({ accessToken, refreshToken, expireTime }: IToken) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken || "");

    if (expireTime && expireTime > 0) {
      const expireAt = Date.now() + expireTime * 1000;
      localStorage.setItem(ACCESS_TOKEN_EXPIRE_KEY, String(expireAt));
    } else {
      localStorage.removeItem(ACCESS_TOKEN_EXPIRE_KEY);
    }
  },

  get: () => {
    if (tokenControl.isExpired()) {
      tokenControl.remove();
      return null;
    }
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  isExpired: () => {
    const expireTime = localStorage.getItem(ACCESS_TOKEN_EXPIRE_KEY);
    return expireTime ? Date.now() > Number(expireTime) : false;
  },

  remove: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(ACCESS_TOKEN_EXPIRE_KEY);
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setUserId: (userId: any) => localStorage.setItem(USER_ID, userId),
  getUserId: () => localStorage.getItem(USER_ID),
  setRoleId: (roleId: number) => localStorage.setItem(ROLE_ID, String(roleId)),
  getRoleId: () => Number(localStorage.getItem(ROLE_ID)),
};

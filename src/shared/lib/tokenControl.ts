const TOKEN_KEY = "interlink/token";

interface IToken {
  token: string;
}

export const tokenControl = {
  set: ({ token }: IToken) => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  get: () => {
    return localStorage.getItem(TOKEN_KEY);
  },

  remove: () => {
    localStorage.removeItem(TOKEN_KEY);
  },
};

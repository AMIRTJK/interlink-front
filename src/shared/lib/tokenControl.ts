const TOKEN_KEY = "interlink/token";
const USER_ID='interlink/userId';
interface IToken {
  token: string;
  userId?:number;
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

  setUserId:(userId:number)=>{
    localStorage.setItem(USER_ID, userId.toString());
  },

  getUserId:()=>{
    return localStorage.getItem(USER_ID);
  },

  removeUserId:()=>{
    localStorage.removeItem(USER_ID);
  },
};

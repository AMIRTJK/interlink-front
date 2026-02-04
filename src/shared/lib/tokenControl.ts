const TOKEN_KEY = "interlink/token";
const USER_ID='interlink/userId';
const OUTGOING_LETTER_COUNT='interlink/outgoingLetterCount';
interface IToken {
  token: string;
  userId?:number;
}

export const tokenControl = {
// Token
  set: ({ token }: IToken) => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  get: () => {
    return localStorage.getItem(TOKEN_KEY);
  },

  remove: () => {
    localStorage.removeItem(TOKEN_KEY);
  },
// User id
  setUserId:(userId:number)=>{
    localStorage.setItem(USER_ID, userId.toString());
  },

  getUserId:()=>{
    return localStorage.getItem(USER_ID);
  },

  removeUserId:()=>{
    localStorage.removeItem(USER_ID);
  },
  
// Outgoing letter count
  setIncomingLetterCount:(count:number)=>{
    localStorage.setItem(OUTGOING_LETTER_COUNT, count.toString());
  },

  getIncomingLetterCount:()=>{
    return localStorage.getItem(OUTGOING_LETTER_COUNT);
  },

  removeOutgoingLetterCount:()=>{
    localStorage.removeItem(OUTGOING_LETTER_COUNT);
  },

// User data
  setUserData: (user: any) => {
    localStorage.setItem('interlink/userData', JSON.stringify(user));
  },

  getUserData: () => {
    const data = localStorage.getItem('interlink/userData');
    return data ? JSON.parse(data) : null;
  },

  removeUserData: () => {
    localStorage.removeItem('interlink/userData');
  }
};

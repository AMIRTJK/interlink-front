const TOKEN_KEY = "interlink/token";
const USER_ID = "interlink/userId";
const OUTGOING_LETTER_COUNT = "interlink/outgoingLetterCount";
const VIEW_MODE_KEY = "interlink/viewMode";
interface IToken {
  token: string;
  userId?: number;
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
  setUserId: (userId: number) => {
    localStorage.setItem(USER_ID, userId.toString());
  },

  getUserId: () => {
    return localStorage.getItem(USER_ID);
  },

  removeUserId: () => {
    localStorage.removeItem(USER_ID);
  },

  // Outgoing letter count
  setIncomingLetterCount: (count: number) => {
    localStorage.setItem(OUTGOING_LETTER_COUNT, count.toString());
  },

  getIncomingLetterCount: () => {
    return localStorage.getItem(OUTGOING_LETTER_COUNT);
  },

  removeOutgoingLetterCount: () => {
    localStorage.removeItem(OUTGOING_LETTER_COUNT);
  },

  // User data
  setUserData: (user: any) => {
    localStorage.setItem("interlink/userData", JSON.stringify(user));
  },

  getUserData: () => {
    const data = localStorage.getItem("interlink/userData");
    return data ? JSON.parse(data) : null;
  },

  removeUserData: () => {
    localStorage.removeItem("interlink/userData");
  },

  setViewMode: (mode: "list" | "block") => {
    localStorage.setItem(VIEW_MODE_KEY, mode);
  },
  getViewMode: () => {
    return localStorage.getItem(VIEW_MODE_KEY);
  },
  removeViewMode: () => {
    localStorage.removeItem(VIEW_MODE_KEY);
  },
};

export interface IDocumentVersion {
  id: string;
  date: string;
  authorId: string | number | null;
  content: string;
}

export const versionControl = {
  getVersions: (docId: string): IDocumentVersion[] => {
    if (!docId) return [];
    const data = localStorage.getItem(`interlink/versions_${docId}`);
    return data ? JSON.parse(data) : [];
  },

  saveVersion: (docId: string, version: IDocumentVersion) => {
    if (!docId) return;
    const current = versionControl.getVersions(docId);
    // Добавляем новую версию в начало массива
    localStorage.setItem(
      `interlink/versions_${docId}`,
      JSON.stringify([version, ...current]),
    );
  },

  clearVersions: (docId: string) => {
    localStorage.removeItem(`interlink/versions_${docId}`);
  },
};

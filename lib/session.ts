export interface UserSession {
  id?: number;
  fullName: string;
  username?: string;
  email?: string;
  phoneNumber?: string;
  role?: string;
  status?: string;
}

let currentUser: UserSession = {
  fullName: 'Ange',
  username: 'ange',
  email: 'user@zikiii.com',
};

let accessToken: string | null = null;
let refreshToken: string | null = null;

export const getSessionUser = (): UserSession => currentUser;

export const setSessionUser = (user: Partial<UserSession>) => {
  currentUser = {
    ...currentUser,
    ...user,
  };
};

export const getSessionToken = (): string | null => accessToken;
export const getRefreshToken = (): string | null => refreshToken;

export const setSessionAuth = (tokens: { accessToken: string; refreshToken?: string }, user?: Partial<UserSession>) => {
  accessToken = tokens.accessToken;
  if (tokens.refreshToken) {
    refreshToken = tokens.refreshToken;
  }
  if (user) {
    setSessionUser(user);
  }
};

export const clearSession = () => {
  accessToken = null;
  refreshToken = null;
  currentUser = {
    fullName: 'Guest',
    username: 'guest',
    email: '',
  };
};

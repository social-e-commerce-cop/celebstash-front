export interface UserSession {
  id?: number;
  fullName: string;
  username?: string;
  email?: string;
  phoneNumber?: string;
  role?: string;
  status?: string;
  avatar?: string;
  profilePicture?: string;
}

const STORAGE_KEYS = {
  USER: 'celebstash_user_session',
  ACCESS_TOKEN: 'celebstash_access_token',
  REFRESH_TOKEN: 'celebstash_refresh_token',
};

function safeGetStorage(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch (e) {
    // ignore
  }
  return null;
}

function safeSetStorage(key: string, value: string | null) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (value === null) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, value);
      }
    }
  } catch (e) {
    // ignore
  }
}

const initialSavedUser = safeGetStorage(STORAGE_KEYS.USER);
let currentUser: UserSession = initialSavedUser
  ? JSON.parse(initialSavedUser)
  : {
      fullName: 'INEZA Gretta',
      username: 'ineza_gretta',
      email: 'karabogretta@gmail.com',
    };

let accessToken: string | null = safeGetStorage(STORAGE_KEYS.ACCESS_TOKEN) || null;
let refreshToken: string | null = safeGetStorage(STORAGE_KEYS.REFRESH_TOKEN) || null;

export const getSessionUser = (): UserSession => currentUser;

export const setSessionUser = (user: Partial<UserSession>) => {
  currentUser = {
    ...currentUser,
    ...user,
  };
  safeSetStorage(STORAGE_KEYS.USER, JSON.stringify(currentUser));
};

export const getSessionToken = (): string | null => accessToken;
export const getRefreshToken = (): string | null => refreshToken;

export const setSessionAuth = (tokens: { accessToken: string; refreshToken?: string }, user?: Partial<UserSession>) => {
  accessToken = tokens.accessToken;
  safeSetStorage(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
  if (tokens.refreshToken) {
    refreshToken = tokens.refreshToken;
    safeSetStorage(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
  }
  if (user) {
    setSessionUser(user);
  }
};

export const clearSession = () => {
  accessToken = null;
  refreshToken = null;
  safeSetStorage(STORAGE_KEYS.ACCESS_TOKEN, null);
  safeSetStorage(STORAGE_KEYS.REFRESH_TOKEN, null);
  safeSetStorage(STORAGE_KEYS.USER, null);
  currentUser = {
    fullName: 'Guest',
    username: 'guest',
    email: '',
  };
};

import { Platform } from 'react-native';

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

const STORAGE_KEY = 'celebstash_session';

/**
 * The signed-out session. Deliberately carries no identity: a pre-filled name/email reads as a
 * real signed-in account to every screen that calls getSessionUser() before login.
 */
const emptyUser = (): UserSession => ({ fullName: '' });

let currentUser: UserSession = emptyUser();
let accessToken: string | null = null;
let refreshToken: string | null = null;
let restorePromise: Promise<void> | null = null;

/** Web can read storage synchronously; native cannot, so it goes through restoreSession(). */
function readWebRaw(): string | null {
  try {
    return globalThis.localStorage?.getItem(STORAGE_KEY) ?? null;
  } catch {
    return null;
  }
}

function applyRaw(raw: string | null) {
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.accessToken) {
      accessToken = parsed.accessToken;
      refreshToken = parsed.refreshToken ?? null;
      if (parsed.user) {
        currentUser = { ...emptyUser(), ...parsed.user };
      }
    }
  } catch (e) {
    console.warn('Failed to parse stored session:', e);
  }
}

// On web this makes the session available on the first render, before restoreSession() resolves.
if (Platform.OS === 'web') {
  applyRaw(readWebRaw());
}

const persist = async () => {
  const payload = JSON.stringify({ accessToken, refreshToken, user: currentUser });

  try {
    if (Platform.OS === 'web') {
      if (accessToken) {
        globalThis.localStorage?.setItem(STORAGE_KEY, payload);
      } else {
        globalThis.localStorage?.removeItem(STORAGE_KEY);
      }
      return;
    }

    // React Native has no localStorage, so a browser-only implementation silently persists
    // nothing and the user is signed out on every app restart. Write to the app's document
    // directory instead.
    const FileSystem = await import('expo-file-system/legacy');
    const dir = FileSystem.documentDirectory;
    if (!dir) return;
    const path = `${dir}${STORAGE_KEY}.json`;

    if (!accessToken) {
      const info = await FileSystem.getInfoAsync(path);
      if (info.exists) {
        await FileSystem.deleteAsync(path, { idempotent: true });
      }
      return;
    }
    await FileSystem.writeAsStringAsync(path, payload);
  } catch (e) {
    console.warn('Failed to persist session:', e);
  }
};

/**
 * Loads any stored session into memory. Safe to call more than once — the work happens once and
 * later callers await the same promise. Call this before deciding where to route on launch.
 */
export const restoreSession = (): Promise<void> => {
  if (!restorePromise) {
    restorePromise = (async () => {
      try {
        if (Platform.OS === 'web') {
          applyRaw(readWebRaw());
          return;
        }

        const FileSystem = await import('expo-file-system/legacy');
        const dir = FileSystem.documentDirectory;
        if (!dir) return;
        const path = `${dir}${STORAGE_KEY}.json`;
        const info = await FileSystem.getInfoAsync(path);
        if (!info.exists) return;
        applyRaw(await FileSystem.readAsStringAsync(path));
      } catch (e) {
        console.warn('Failed to restore session:', e);
      }
    })();
  }
  return restorePromise;
};

export const getSessionUser = (): UserSession => currentUser;

export const setSessionUser = (user: Partial<UserSession>) => {
  currentUser = { ...currentUser, ...user };
  void persist();
};

export const getSessionToken = (): string | null => accessToken;
export const getRefreshToken = (): string | null => refreshToken;

export const setSessionAuth = (
  tokens: { accessToken: string; refreshToken?: string },
  user?: Partial<UserSession>
) => {
  accessToken = tokens.accessToken;
  if (tokens.refreshToken) {
    refreshToken = tokens.refreshToken;
  }
  if (user) {
    currentUser = { ...currentUser, ...user };
  }
  void persist();
};

export const clearSession = () => {
  accessToken = null;
  refreshToken = null;
  currentUser = emptyUser();
  void persist();
};

export const isAuthenticated = (): boolean => Boolean(accessToken);

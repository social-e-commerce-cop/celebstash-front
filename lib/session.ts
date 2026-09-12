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
 * The signed-out session. Deliberately carries no fabricated identity: a placeholder like
 * "Guest"/"guest" reads as a real account and can collide with a real username when screens
 * compare the current user against post or comment authors.
 */
const emptyUser = (): UserSession => ({
  fullName: '',
});

let currentUser: UserSession = emptyUser();
let accessToken: string | null = null;
let refreshToken: string | null = null;
let restorePromise: Promise<void> | null = null;

type SessionExpiredHandler = () => void;
const sessionExpiredHandlers = new Set<SessionExpiredHandler>();

/**
 * Subscribe to involuntary session loss (a 401 from the backend), so the app can send the
 * user back to the sign-in screen. Voluntary logout does not fire this.
 */
export const onSessionExpired = (handler: SessionExpiredHandler): (() => void) => {
  sessionExpiredHandlers.add(handler);
  return () => {
    sessionExpiredHandlers.delete(handler);
  };
};

const persist = async () => {
  const payload = JSON.stringify({
    accessToken,
    refreshToken,
    user: currentUser,
  });

  try {
    if (Platform.OS === 'web') {
      if (accessToken) {
        globalThis.localStorage?.setItem(STORAGE_KEY, payload);
      } else {
        globalThis.localStorage?.removeItem(STORAGE_KEY);
      }
      return;
    }

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

export const restoreSession = (): Promise<void> => {
  if (!restorePromise) {
    restorePromise = (async () => {
      try {
        let raw: string | null = null;
        if (Platform.OS === 'web') {
          raw = globalThis.localStorage?.getItem(STORAGE_KEY) ?? null;
        } else {
          const FileSystem = await import('expo-file-system/legacy');
          const dir = FileSystem.documentDirectory;
          if (!dir) return;
          const path = `${dir}${STORAGE_KEY}.json`;
          const info = await FileSystem.getInfoAsync(path);
          if (!info.exists) return;
          raw = await FileSystem.readAsStringAsync(path);
        }
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (parsed?.accessToken) {
          accessToken = parsed.accessToken;
          refreshToken = parsed.refreshToken || null;
          if (parsed.user) {
            currentUser = { ...emptyUser(), ...parsed.user };
          }
        }
      } catch (e) {
        console.warn('Failed to restore session:', e);
      }
    })();
  }
  return restorePromise;
};

export const getSessionUser = (): UserSession => currentUser;

export const setSessionUser = (user: Partial<UserSession>) => {
  currentUser = {
    ...currentUser,
    ...user,
  };
  void persist();
};

export const getSessionToken = (): string | null => accessToken;
export const getRefreshToken = (): string | null => refreshToken;

export const setSessionAuth = (tokens: { accessToken: string; refreshToken?: string }, user?: Partial<UserSession>) => {
  accessToken = tokens.accessToken;
  if (tokens.refreshToken) {
    refreshToken = tokens.refreshToken;
  }
  if (user) {
    currentUser = {
      ...currentUser,
      ...user,
    };
  }
  void persist();
};

/**
 * Clears the stored session.
 *
 * @param reason 'expired' when the backend rejected our token (401) — subscribers are notified
 *               so the user is returned to sign-in. Omit for a deliberate logout.
 */
export const clearSession = (reason?: 'expired') => {
  const hadSession = Boolean(accessToken);
  accessToken = null;
  refreshToken = null;
  currentUser = emptyUser();
  void persist();

  if (reason === 'expired' && hadSession) {
    sessionExpiredHandlers.forEach((handler) => {
      try {
        handler();
      } catch (e) {
        console.warn('Session expiry handler failed:', e);
      }
    });
  }
};

export const isAuthenticated = (): boolean => Boolean(accessToken);

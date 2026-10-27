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

/** Non-secret profile data (name, role, avatar). File on native, localStorage on web. */
const STORAGE_KEY = 'celebstash_session';
/** Access + refresh token, kept in the platform keychain/keystore on native. */
const SECURE_TOKENS_KEY = 'celebstash_auth_tokens';

/**
 * The signed-out session. Deliberately carries no identity: a pre-filled name/email reads as a
 * real signed-in account to every screen that calls getSessionUser() before login.
 */
const emptyUser = (): UserSession => ({ fullName: '' });

let currentUser: UserSession = emptyUser();
let accessToken: string | null = null;
let refreshToken: string | null = null;
let restorePromise: Promise<void> | null = null;

// ── Auth change notifications ────────────────────────────────────────────────
/**
 * 'signedIn'  — tokens were stored after a login/signup/refresh.
 * 'signedOut' — the user chose Sign Out.
 * 'expired'   — the server rejected the refresh token, so the session cannot continue.
 */
export type SessionEvent = 'signedIn' | 'signedOut' | 'expired';
type SessionListener = (event: SessionEvent) => void;
const listeners = new Set<SessionListener>();

export const subscribeSession = (listener: SessionListener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const emit = (event: SessionEvent) => {
  listeners.forEach((l) => {
    try {
      l(event);
    } catch (e) {
      console.warn('Session listener failed:', e);
    }
  });
};

// ── Secure token storage ─────────────────────────────────────────────────────
type SecureStoreModule = typeof import('expo-secure-store');
let secureStore: SecureStoreModule | null | undefined;

/**
 * expo-secure-store is a native module: a build made before it was added has no binary for it,
 * and requiring it then throws. In that case tokens fall back to the app's private document
 * directory (the previous behaviour) rather than the user being signed out on every launch.
 */
function getSecureStore(): SecureStoreModule | null {
  if (Platform.OS === 'web') return null;
  if (secureStore !== undefined) return secureStore;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('expo-secure-store') as SecureStoreModule;
    secureStore = typeof mod?.setItemAsync === 'function' ? mod : null;
  } catch {
    secureStore = null;
  }
  if (!secureStore && __DEV__) {
    console.warn('[session] expo-secure-store is unavailable in this build; rebuild the app to store tokens securely.');
  }
  return secureStore;
}

/** AFTER_FIRST_UNLOCK keeps the token readable after a device restart once the phone is unlocked. */
const secureOptions = (store: SecureStoreModule) => ({
  keychainAccessible: store.AFTER_FIRST_UNLOCK,
});

async function getFileSystem() {
  const FileSystem = await import('expo-file-system/legacy');
  const dir = FileSystem.documentDirectory;
  return dir ? { FileSystem, path: `${dir}${STORAGE_KEY}.json` } : null;
}

/** Web can read storage synchronously; native cannot, so it goes through restoreSession(). */
function readWebRaw(): string | null {
  try {
    return globalThis.localStorage?.getItem(STORAGE_KEY) ?? null;
  } catch {
    return null;
  }
}

function applyTokens(parsed: any) {
  if (parsed?.accessToken) {
    accessToken = parsed.accessToken;
    refreshToken = parsed.refreshToken ?? null;
  }
}

function applyUser(parsed: any) {
  if (parsed?.user) {
    currentUser = { ...emptyUser(), ...parsed.user };
  }
}

function parse(raw: string | null): any {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse stored session:', e);
    return null;
  }
}

// On web this makes the session available on the first render, before restoreSession() resolves.
if (Platform.OS === 'web') {
  const parsed = parse(readWebRaw());
  applyTokens(parsed);
  if (accessToken) applyUser(parsed);
}

async function writeNative() {
  const fs = await getFileSystem();
  const store = getSecureStore();

  if (!accessToken) {
    if (store) {
      await store.deleteItemAsync(SECURE_TOKENS_KEY).catch(() => {});
    }
    if (fs) {
      const info = await fs.FileSystem.getInfoAsync(fs.path);
      if (info.exists) await fs.FileSystem.deleteAsync(fs.path, { idempotent: true });
    }
    return;
  }

  let tokensStoredSecurely = false;
  if (store) {
    try {
      await store.setItemAsync(
        SECURE_TOKENS_KEY,
        JSON.stringify({ accessToken, refreshToken }),
        secureOptions(store)
      );
      tokensStoredSecurely = true;
    } catch (e) {
      console.warn('Secure token write failed, falling back to app storage:', e);
    }
  }

  if (fs) {
    // The profile is not a secret. Tokens only go in this file when secure storage is missing.
    const payload = tokensStoredSecurely
      ? { user: currentUser }
      : { accessToken, refreshToken, user: currentUser };
    await fs.FileSystem.writeAsStringAsync(fs.path, JSON.stringify(payload));
  }
}

/** Writes are chained so a quick setSessionUser() + setSessionAuth() cannot land out of order. */
let persistChain: Promise<void> = Promise.resolve();

const persist = (): Promise<void> => {
  persistChain = persistChain
    .then(async () => {
      if (Platform.OS === 'web') {
        if (accessToken) {
          globalThis.localStorage?.setItem(
            STORAGE_KEY,
            JSON.stringify({ accessToken, refreshToken, user: currentUser })
          );
        } else {
          globalThis.localStorage?.removeItem(STORAGE_KEY);
        }
        return;
      }
      await writeNative();
    })
    .catch((e) => console.warn('Failed to persist session:', e));
  return persistChain;
};

/**
 * Loads any stored session into memory. Safe to call more than once — the work happens once and
 * later callers await the same promise. Call this before deciding where to route on launch.
 *
 * A session written by an older build kept its tokens in the plain profile file; those are moved
 * into secure storage here so upgrading the app does not sign anyone out.
 */
export const restoreSession = (): Promise<void> => {
  if (!restorePromise) {
    restorePromise = (async () => {
      try {
        if (Platform.OS === 'web') {
          const parsed = parse(readWebRaw());
          applyTokens(parsed);
          if (accessToken) applyUser(parsed);
          return;
        }

        const fs = await getFileSystem();
        const fileData =
          fs && (await fs.FileSystem.getInfoAsync(fs.path)).exists
            ? parse(await fs.FileSystem.readAsStringAsync(fs.path))
            : null;

        const store = getSecureStore();
        let secureData: any = null;
        if (store) {
          try {
            secureData = parse(await store.getItemAsync(SECURE_TOKENS_KEY, secureOptions(store)));
          } catch (e) {
            console.warn('Secure token read failed:', e);
          }
        }

        if (secureData?.accessToken) {
          applyTokens(secureData);
        } else if (fileData?.accessToken) {
          applyTokens(fileData);
        }
        if (accessToken) {
          applyUser(fileData);
        }

        // Migrate legacy plain-file tokens into secure storage.
        if (store && fileData?.accessToken) {
          await persist();
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
  currentUser = { ...currentUser, ...user };
  void persist();
};

export const getSessionToken = (): string | null => accessToken;
export const getRefreshToken = (): string | null => refreshToken;

export const setSessionAuth = (
  tokens: { accessToken: string; refreshToken?: string },
  user?: Partial<UserSession>
) => {
  const wasSignedIn = Boolean(accessToken);
  accessToken = tokens.accessToken;
  if (tokens.refreshToken) {
    refreshToken = tokens.refreshToken;
  }
  if (user) {
    currentUser = { ...currentUser, ...user };
  }
  void persist();
  if (!wasSignedIn) emit('signedIn');
};

/**
 * Ends the session locally. Use authService.logout() for a user-initiated sign out so the
 * refresh token is also revoked on the server.
 */
export const clearSession = (reason: 'signedOut' | 'expired' = 'signedOut'): Promise<void> => {
  const wasSignedIn = Boolean(accessToken);
  accessToken = null;
  refreshToken = null;
  currentUser = emptyUser();
  const done = persist();
  if (wasSignedIn) emit(reason);
  return done;
};

export const isAuthenticated = (): boolean => Boolean(accessToken);

// ── Token expiry ─────────────────────────────────────────────────────────────
const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function base64UrlDecode(input: string): string {
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/');
  let out = '';
  let buffer = 0;
  let bits = 0;
  for (const ch of b64) {
    const val = B64.indexOf(ch);
    if (val < 0) continue; // padding
    buffer = (buffer << 6) | val;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out += String.fromCharCode((buffer >> bits) & 0xff);
    }
  }
  return out;
}

/**
 * Epoch milliseconds at which the stored access token expires, read from its JWT `exp` claim.
 * Only used to decide when to refresh — the server remains the authority on validity.
 */
export const getAccessTokenExpiry = (): number | null => {
  if (!accessToken) return null;
  try {
    const payload = accessToken.split('.')[1];
    if (!payload) return null;
    const exp = JSON.parse(base64UrlDecode(payload))?.exp;
    return typeof exp === 'number' ? exp * 1000 : null;
  } catch {
    return null;
  }
};

/** True when the access token expires within `marginMs` (or already has). */
export const isAccessTokenExpiring = (marginMs = 60_000): boolean => {
  const exp = getAccessTokenExpiry();
  return exp !== null && exp - Date.now() <= marginMs;
};

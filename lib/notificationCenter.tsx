/**
 * notificationCenter.tsx — app-wide notification state.
 *
 * One STOMP connection per signed-in session subscribes to /user/queue/notifications, where the
 * backend pushes each notification after it is committed. From that stream this provider:
 *   - keeps the bell and inbox badge counts current (re-read from the server, never guessed),
 *   - shows a single in-app banner per new event,
 *   - lets screens (the notifications list) react to new items without polling.
 *
 * The connection is opened on sign-in / session restore and closed on sign-out, so there is
 * exactly one listener regardless of how often screens mount.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { getWorkingBaseUrl, ensureFreshAccessToken } from './apiClient';
import { getSessionToken, isAuthenticated, subscribeSession } from './session';
import { notificationService, NotificationResponse } from './notificationService';
import { chatService } from './chatService';

let StompClient: any;
let SockJS: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  StompClient = require('@stomp/stompjs').Client;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  SockJS = require('sockjs-client');
} catch {
  StompClient = null;
  SockJS = null;
}

type NotificationListener = (n: NotificationResponse) => void;

interface NotificationCenterValue {
  unreadNotifications: number;
  unreadMessages: number;
  /** The notification currently shown as a banner, if any. */
  banner: NotificationResponse | null;
  dismissBanner: () => void;
  /** Re-reads both badge counts from the server. */
  refreshCounts: () => void;
  /** Optimistic local decrement after the user opens a notification. */
  noteNotificationsRead: (count?: number) => void;
  /** Called by ChatScreen so banners for the open conversation are suppressed. */
  setActiveConversationId: (id: number | null) => void;
  /** Subscribe to every newly pushed notification. Returns an unsubscribe function. */
  onNotification: (listener: NotificationListener) => () => void;
}

const NotificationCenterContext = createContext<NotificationCenterValue | null>(null);

/** How long a banner stays up. */
const BANNER_MS = 4500;
/** Minimum gap between count refreshes triggered by bursts of pushes or app resumes. */
const REFRESH_DEBOUNCE_MS = 400;

export function NotificationCenterProvider({ children }: { children: React.ReactNode }) {
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [banner, setBanner] = useState<NotificationResponse | null>(null);

  const clientRef = useRef<any>(null);
  const listenersRef = useRef(new Set<NotificationListener>());
  /** "id:createdAt" of events already shown. A collapsed message notification keeps its id but
   *  gets a new createdAt, so each new message still shows once — and only once. */
  const seenRef = useRef(new Set<string>());
  const activeConversationRef = useRef<number | null>(null);
  const bannerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refreshCounts = useCallback(() => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    refreshTimer.current = setTimeout(async () => {
      if (!isAuthenticated()) return;
      const [n, m] = await Promise.allSettled([
        notificationService.getUnreadCount(),
        chatService.getUnreadCount(),
      ]);
      if (n.status === 'fulfilled') setUnreadNotifications(n.value);
      if (m.status === 'fulfilled') setUnreadMessages(m.value);
    }, REFRESH_DEBOUNCE_MS);
  }, []);

  const dismissBanner = useCallback(() => {
    if (bannerTimer.current) clearTimeout(bannerTimer.current);
    bannerTimer.current = null;
    setBanner(null);
  }, []);

  const showBanner = useCallback((n: NotificationResponse) => {
    if (bannerTimer.current) clearTimeout(bannerTimer.current);
    setBanner(n);
    bannerTimer.current = setTimeout(() => setBanner(null), BANNER_MS);
  }, []);

  const handlePush = useCallback((n: NotificationResponse) => {
    const key = `${n.id}:${n.createdAt}`;
    if (seenRef.current.has(key)) return;
    seenRef.current.add(key);
    if (seenRef.current.size > 500) seenRef.current = new Set(Array.from(seenRef.current).slice(-250));

    listenersRef.current.forEach((l) => {
      try {
        l(n);
      } catch {}
    });
    refreshCounts();

    const viewingThisChat =
      n.type === 'NEW_MESSAGE' && n.relatedEntityId != null && n.relatedEntityId === activeConversationRef.current;
    if (!viewingThisChat) showBanner(n);
  }, [refreshCounts, showBanner]);

  const disconnect = useCallback(() => {
    const c = clientRef.current;
    clientRef.current = null;
    if (c) {
      try {
        c.deactivate();
      } catch {}
    }
  }, []);

  const connect = useCallback(() => {
    if (!StompClient || !SockJS || clientRef.current || !getSessionToken()) return;

    const client = new StompClient({
      webSocketFactory: () => new SockJS(`${getWorkingBaseUrl()}/ws`),
      reconnectDelay: 5000,
      // Runs before every (re)connect, so a reconnect after hours in the background presents a
      // fresh token instead of the one the socket was first opened with.
      beforeConnect: async () => {
        await ensureFreshAccessToken();
        const token = getSessionToken();
        if (!token) {
          await client.deactivate();
          return;
        }
        client.connectHeaders = { Authorization: `Bearer ${token}` };
      },
      onConnect: () => {
        client.subscribe('/user/queue/notifications', (frame: any) => {
          try {
            handlePush(JSON.parse(frame.body) as NotificationResponse);
          } catch (e) {
            if (__DEV__) console.warn('[notifications] bad frame', e);
          }
        });
        // Anything that happened while disconnected is reflected in the counts.
        refreshCounts();
      },
      onStompError: (frame: any) => {
        if (__DEV__) console.warn('[notifications] STOMP error', frame?.headers?.message);
      },
    });
    clientRef.current = client;
    client.activate();
  }, [handlePush, refreshCounts]);

  // Follow the session: connect when signed in, tear everything down on sign-out/expiry.
  useEffect(() => {
    if (isAuthenticated()) {
      connect();
      refreshCounts();
    }
    const unsubscribe = subscribeSession((event) => {
      if (event === 'signedIn') {
        connect();
        refreshCounts();
      } else {
        disconnect();
        seenRef.current.clear();
        setUnreadNotifications(0);
        setUnreadMessages(0);
        setBanner(null);
      }
    });
    return () => {
      unsubscribe();
      disconnect();
    };
  }, [connect, disconnect, refreshCounts]);

  // Coming back to the foreground: the socket may have been suspended, so re-sync the counts.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && isAuthenticated()) {
        connect();
        refreshCounts();
      }
    });
    return () => sub.remove();
  }, [connect, refreshCounts]);

  useEffect(() => () => {
    if (bannerTimer.current) clearTimeout(bannerTimer.current);
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
  }, []);

  const value = useMemo<NotificationCenterValue>(() => ({
    unreadNotifications,
    unreadMessages,
    banner,
    dismissBanner,
    refreshCounts,
    noteNotificationsRead: (count = 1) => setUnreadNotifications((c) => Math.max(0, c - count)),
    setActiveConversationId: (id) => {
      activeConversationRef.current = id;
    },
    onNotification: (listener) => {
      listenersRef.current.add(listener);
      return () => {
        listenersRef.current.delete(listener);
      };
    },
  }), [unreadNotifications, unreadMessages, banner, dismissBanner, refreshCounts]);

  return (
    <NotificationCenterContext.Provider value={value}>
      {children}
    </NotificationCenterContext.Provider>
  );
}

export function useNotificationCenter(): NotificationCenterValue {
  const ctx = useContext(NotificationCenterContext);
  if (!ctx) throw new Error('useNotificationCenter must be used inside NotificationCenterProvider');
  return ctx;
}

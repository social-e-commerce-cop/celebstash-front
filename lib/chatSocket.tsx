/**
 * chatSocket.tsx — real-time chat transport (STOMP over SockJS).
 *
 * Subscribes to the typed event stream at /topic/conversation/{id}/events and keeps the
 * connection authenticated with the same JWT the REST client uses. The bare
 * /topic/conversation/{id} destination still carries new messages for older clients; this hook
 * uses the event stream so it also receives edits, deletes, reactions, typing and presence.
 */
import { useEffect, useRef, useCallback, useState } from 'react';
import { API_BASE_URL } from './apiClient';
import { getSessionToken } from './session';
import type { MessageDto } from './chatService';

let StompClient: any;
try {
  StompClient = require('@stomp/stompjs').Client;
} catch {
  StompClient = null;
}

let SockJS: any;
try {
  SockJS = require('sockjs-client');
} catch {
  SockJS = null;
}

/** Mirrors ChatEvent's constants on the backend. */
export type ChatEventType =
  | 'message.new'
  | 'message.updated'
  | 'message.deleted'
  | 'message.reaction'
  | 'message.read'
  | 'message.delivered'
  | 'typing.start'
  | 'typing.stop'
  | 'presence'
  | 'conversation.updated'
  | 'group.member.added'
  | 'group.member.removed';

export interface ChatEvent<T = any> {
  type: ChatEventType;
  conversationId: number;
  payload: T;
}

export interface DeliveredPayload { messageId: number; conversationId: number }
export interface MemberPayload { userId: number; userName: string; actorId: number }
export interface TypingPayload { userId: number; userName: string }
export interface PresencePayload { userId: number; online: boolean; lastSeen: string | null }
export interface ReadPayload { userId: number; lastReadMessageId: number }
export interface DeletedPayload { messageId: number; forEveryone: boolean }

export type ConnectionState = 'connecting' | 'connected' | 'disconnected';

/** How often to refresh the presence window. Must stay below the server's 60s TTL. */
const HEARTBEAT_MS = 25000;
/** Local safety net: clear a typing indicator if no stop arrives (sender crashed/backgrounded). */
const TYPING_TIMEOUT_MS = 6000;

interface UseChatSocketOptions {
  onEvent?: (event: ChatEvent) => void;
  onMessage?: (msg: MessageDto) => void;
}

export function useChatSocket(
  conversationId: number | string | null,
  options: UseChatSocketOptions | ((msg: MessageDto) => void) = {}
) {
  // Backwards compatible: earlier callers passed a bare onMessage callback.
  const opts: UseChatSocketOptions =
    typeof options === 'function' ? { onMessage: options } : options;

  const clientRef = useRef<any>(null);
  const subsRef = useRef<any[]>([]);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const typingTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});
  const handlersRef = useRef(opts);

  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [typingUsers, setTypingUsers] = useState<TypingPayload[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Record<number, boolean>>({});

  useEffect(() => {
    handlersRef.current = typeof options === 'function' ? { onMessage: options } : options;
  });

  const clearTypingFor = useCallback((userId: number) => {
    setTypingUsers((prev) => prev.filter((u) => u.userId !== userId));
    const t = typingTimers.current[userId];
    if (t) {
      clearTimeout(t);
      delete typingTimers.current[userId];
    }
  }, []);

  const handleEvent = useCallback((evt: ChatEvent) => {
    switch (evt.type) {
      case 'typing.start': {
        const p = evt.payload as TypingPayload;
        setTypingUsers((prev) => (prev.some((u) => u.userId === p.userId) ? prev : [...prev, p]));
        // Without this the indicator sticks forever if the sender never sends typing.stop.
        if (typingTimers.current[p.userId]) clearTimeout(typingTimers.current[p.userId]);
        typingTimers.current[p.userId] = setTimeout(() => clearTypingFor(p.userId), TYPING_TIMEOUT_MS);
        break;
      }
      case 'typing.stop':
        clearTypingFor((evt.payload as TypingPayload).userId);
        break;
      case 'presence': {
        const p = evt.payload as PresencePayload;
        setOnlineUsers((prev) => ({ ...prev, [p.userId]: p.online }));
        break;
      }
      case 'message.new':
        // A message ends any typing indicator from its sender.
        clearTypingFor((evt.payload as MessageDto).senderId);
        handlersRef.current.onMessage?.(evt.payload as MessageDto);
        break;
      default:
        break;
    }
    handlersRef.current.onEvent?.(evt);
  }, [clearTypingFor]);

  const connect = useCallback(() => {
    if (!conversationId || !StompClient || !SockJS) return;
    if (clientRef.current?.active) return;

    const token = getSessionToken();
    if (!token) return; // the server rejects unauthenticated CONNECT frames

    setConnectionState('connecting');

    const client = new StompClient({
      webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws`),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        setConnectionState('connected');
        subsRef.current = [
          client.subscribe(`/topic/conversation/${conversationId}/events`, (frame: any) => {
            try {
              handleEvent(JSON.parse(frame.body) as ChatEvent);
            } catch (e) {
              console.warn('[ChatSocket] bad event frame', e);
            }
          }),
        ];

        client.publish({ destination: '/app/presence/heartbeat', body: '' });
        heartbeatRef.current = setInterval(() => {
          if (client.connected) client.publish({ destination: '/app/presence/heartbeat', body: '' });
        }, HEARTBEAT_MS);
      },
      onWebSocketClose: () => setConnectionState('disconnected'),
      onStompError: (frame: any) => {
        setConnectionState('disconnected');
        console.warn('[ChatSocket] STOMP error', frame?.headers?.message);
      },
    });

    client.activate();
    clientRef.current = client;
  }, [conversationId, handleEvent]);

  const disconnect = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
    Object.values(typingTimers.current).forEach(clearTimeout);
    typingTimers.current = {};
    subsRef.current.forEach((s) => { try { s.unsubscribe(); } catch {} });
    subsRef.current = [];
    clientRef.current?.deactivate();
    clientRef.current = null;
    setConnectionState('disconnected');
    setTypingUsers([]);
  }, []);

  /** Tell the conversation this user started/stopped typing. Never persisted. */
  const sendTyping = useCallback((typing: boolean) => {
    const c = clientRef.current;
    if (c?.connected && conversationId) {
      c.publish({ destination: `/app/chat/${conversationId}/typing`, body: String(typing) });
    }
  }, [conversationId]);

  useEffect(() => {
    // connect() flips connectionState to 'connecting' straight away. Calling it in the effect
    // body would be a state update during the effect, which React's purity rules disallow
    // (react-hooks/set-state-in-effect), so the dial-up is scheduled instead. The timer is
    // cancelled on unmount so a screen closed immediately never opens a socket at all.
    const id = setTimeout(connect, 0);
    return () => {
      clearTimeout(id);
      disconnect();
    };
  }, [connect, disconnect]);

  return { connectionState, typingUsers, onlineUsers, sendTyping };
}

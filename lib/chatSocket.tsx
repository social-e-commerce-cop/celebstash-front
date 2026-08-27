/**
 * chatSocket.tsx — WebSocket client for real-time chat using STOMP over SockJS.
 *
 * Usage:
 *   useChatSocket(conversationId, onNewMessage);
 */
import { useEffect, useRef, useCallback } from 'react';
import { API_BASE_URL } from './apiClient';
import { getSessionToken } from './session';
import type { MessageDto } from './chatService';

// @stomp/stompjs v7+
let StompClient: any;
try {
  StompClient = require('@stomp/stompjs').Client;
} catch {
  StompClient = null;
}

// SockJS polyfill for React Native
let SockJS: any;
try {
  SockJS = require('sockjs-client');
} catch {
  SockJS = null;
}

export function useChatSocket(
  conversationId: number | string | null,
  onMessage: (msg: MessageDto) => void
) {
  const clientRef = useRef<any>(null);
  const subscriptionRef = useRef<any>(null);
  const onMessageRef = useRef(onMessage);

  // Keep callback ref up to date without triggering reconnects
  useEffect(() => {
    onMessageRef.current = onMessage;
  });

  const connect = useCallback(() => {
    if (!conversationId || !StompClient || !SockJS) return;
    if (clientRef.current?.active) return; // already connected

    const token = getSessionToken();
    const wsUrl = API_BASE_URL + '/ws';

    const stompClient = new StompClient({
      webSocketFactory: () => new SockJS(wsUrl),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 5000,
      onConnect: () => {
        subscriptionRef.current = stompClient.subscribe(
          `/topic/conversation/${conversationId}`,
          (frame: any) => {
            try {
              const msg: MessageDto = JSON.parse(frame.body);
              onMessageRef.current(msg);
            } catch (e) {
              console.warn('[ChatSocket] Failed to parse message', e);
            }
          }
        );
      },
      onStompError: (frame: any) => {
        console.warn('[ChatSocket] STOMP error', frame.headers?.['message']);
      },
    });

    stompClient.activate();
    clientRef.current = stompClient;
  }, [conversationId]);

  const disconnect = useCallback(() => {
    subscriptionRef.current?.unsubscribe();
    subscriptionRef.current = null;
    clientRef.current?.deactivate();
    clientRef.current = null;
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);
}

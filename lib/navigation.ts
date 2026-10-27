import { createNavigationContainerRef, StackActions } from '@react-navigation/native';
import type { NotificationResponse } from './notificationService';

/**
 * Ref to the app's root navigator, for code that runs outside a screen: the in-app notification
 * banner, and returning to sign-in when the server ends the session.
 */
export const navigationRef = createNavigationContainerRef<any>();

export function navigate(name: string, params?: object) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.push(name, params));
  }
}

export function resetTo(name: string) {
  if (navigationRef.isReady()) {
    navigationRef.reset({ index: 0, routes: [{ name }] });
  }
}

export const POST_NOTIFICATION_TYPES = ['LIKE', 'COMMENT', 'REPOST', 'SHARE', 'LIKE_COMMENT_ACTIVITY', 'STORY_POST_ACTIVITY'];

/** True when tapping the notification leads somewhere. */
export function hasNotificationTarget(n: Pick<NotificationResponse, 'type' | 'relatedEntityId' | 'actorId'>): boolean {
  if (n.type === 'NEW_FOLLOWER') return Boolean(n.relatedEntityId || n.actorId);
  return Boolean(n.relatedEntityId) &&
    (POST_NOTIFICATION_TYPES.includes(n.type) || n.type === 'NEW_MESSAGE' || n.type === 'STORY_INTERACTION');
}

/**
 * Opens the screen a notification is about. Shared by the notifications list and the in-app
 * banner so both behave the same.
 */
export function openNotificationTarget(
  n: Pick<NotificationResponse, 'type' | 'relatedEntityId' | 'actorId' | 'actorName' | 'actorUsername'>,
  myUserId?: number
) {
  const id = n.relatedEntityId ?? undefined;

  if (n.type === 'NEW_FOLLOWER') {
    const userId = id ?? n.actorId;
    if (userId) {
      navigate('MyProfile', {
        isOtherUser: true,
        userId,
        name: n.actorName ?? undefined,
        username: n.actorUsername ?? undefined,
      });
    }
    return;
  }
  if (!id) return;

  if (n.type === 'NEW_MESSAGE') {
    navigate('ChatScreen', { conversationId: String(id) });
  } else if (POST_NOTIFICATION_TYPES.includes(n.type)) {
    navigate('PostDetail', { postId: id, openComments: n.type === 'COMMENT' });
  } else if (n.type === 'STORY_INTERACTION' && myUserId) {
    // Reactions arrive on the author's own story: open it so they can see the viewers sheet.
    navigate('ProfileDetails', { userId: myUserId, startStoryId: id });
  }
}

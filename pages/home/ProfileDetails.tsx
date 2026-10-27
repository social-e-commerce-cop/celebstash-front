import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ScrollView,
  TextInput,
  ActivityIndicator,
  PanResponder,
  Keyboard,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation, useRoute } from "@react-navigation/native";
import Svg, { Path } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";
import {
  storiesService,
  groupStories,
  isStoryActive,
  STORY_REACTIONS,
  StoryGroup,
  StoryItem,
  StoryViewer,
} from "@/lib/storiesService";
import { followService } from "@/lib/followService";
import { resolveImageUrl } from "@/lib/apiClient";
import { getSessionUser } from "@/lib/session";
import { formatRelativeTime } from "@/lib/time";

const { width, height } = Dimensions.get("window");

const IMAGE_DURATION_MS = 5000;
const VIDEO_FALLBACK_MS = 15000;
const TICK_MS = 50;
const DEFAULT_AVATAR = require("../../assets/images/profile.jpg");
const avatarSource = (url?: string | null) => (url ? { uri: resolveImageUrl(url) } : DEFAULT_AVATAR);

/**
 * Story viewer. Opened from the Home stories row with all artists' groups, or from a
 * notification with a single user's id (their stories are then fetched).
 *
 * Route params: { groups?, startUserId? } or { userId, startStoryId? }.
 */
const ProfileDetails: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const route = useRoute<any>();
  const me = getSessionUser();

  const [groups, setGroups] = useState<StoryGroup[]>(() =>
    (route.params?.groups as StoryGroup[] | undefined)?.filter((g) => g.stories.some((s) => isStoryActive(s))) ?? []
  );
  const [loading, setLoading] = useState(!route.params?.groups && Boolean(route.params?.userId));
  const [loadError, setLoadError] = useState<string | null>(null);
  const [groupIndex, setGroupIndex] = useState(() => {
    const start = route.params?.startUserId;
    const i = groups.findIndex((g) => g.userId === start);
    return i >= 0 ? i : 0;
  });
  const [storyIndex, setStoryIndex] = useState(() => {
    const g = groups[groupIndex];
    const firstUnseen = g?.stories.findIndex((s) => !s.isViewedByMe) ?? -1;
    return firstUnseen >= 0 ? firstUnseen : 0;
  });
  const [progress, setProgress] = useState(0);
  const [holdPaused, setHoldPaused] = useState(false);
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [viewersOpen, setViewersOpen] = useState(false);
  const [viewers, setViewers] = useState<StoryViewer[] | null>(null);
  const [viewersError, setViewersError] = useState(false);
  const [following, setFollowing] = useState<boolean | null>(null);

  const pressStartTime = useRef(0);
  const progressValue = useRef(0);
  const viewedIds = useRef(new Set<number>());
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Opened by user id (notification): fetch that user's active stories.
  useEffect(() => {
    const userId = route.params?.userId;
    if (route.params?.groups || !userId) return;
    let cancelled = false;
    storiesService
      .getUserStories(Number(userId))
      .then((stories) => {
        if (cancelled) return;
        const g = groupStories(stories, me.id);
        setGroups(g);
        const startId = route.params?.startStoryId;
        const idx = g[0]?.stories.findIndex((s) => s.id === startId) ?? -1;
        setGroupIndex(0);
        setStoryIndex(idx >= 0 ? idx : 0);
      })
      .catch(() => !cancelled && setLoadError("Could not load this story."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [route.params?.userId, route.params?.groups, route.params?.startStoryId, me.id]);

  const group = groups[groupIndex];
  const story: StoryItem | undefined = group?.stories[storyIndex];
  // Compared as numbers: a strict === between a numeric id and one restored as a string (or a
  // missing id) silently treated the author as an ordinary viewer, hiding their views bar.
  const isOwn = Boolean(story && me.id != null && Number(story.userId) === Number(me.id));

  // Images: progress waits until the picture has actually loaded, and a failed load says so
  // instead of leaving a black screen.
  const [loadedMediaId, setLoadedMediaId] = useState<number | null>(null);
  const [failedMediaId, setFailedMediaId] = useState<number | null>(null);
  const mediaPending = Boolean(
    story && story.mediaType !== "VIDEO" && loadedMediaId !== story.id && failedMediaId !== story.id
  );
  const paused = holdPaused || replying || viewersOpen || mediaPending;

  // isFocused() guards against a second goBack (auto-close at the end racing a tap on X).
  const close = useCallback(() => {
    if (navigation.isFocused()) navigation.goBack();
  }, [navigation]);

  // ── Video ──────────────────────────────────────────────────────────────────
  const videoSource = story?.mediaType === "VIDEO" ? resolveImageUrl(story.mediaUrl) : null;
  const player = useVideoPlayer(videoSource, (p) => {
    p.loop = false;
  });
  useEffect(() => {
    if (!videoSource) return;
    if (paused) player.pause();
    else player.play();
  }, [player, videoSource, paused]);

  /** Read inside the ticker: a video's duration is only known once it has loaded. */
  const currentDurationMs = useCallback(() => {
    if (story?.mediaType !== "VIDEO") return IMAGE_DURATION_MS;
    const d = player.duration;
    return d && d > 0 ? d * 1000 : VIDEO_FALLBACK_MS;
  }, [story?.mediaType, player]);

  // ── Navigation between stories ─────────────────────────────────────────────
  const goTo = useCallback((g: number, s: number) => {
    progressValue.current = 0;
    setGroupIndex(g);
    setStoryIndex(s);
    setProgress(0);
    setViewers(null);
  }, []);

  const next = useCallback(() => {
    if (!group) return close();
    if (storyIndex < group.stories.length - 1) return goTo(groupIndex, storyIndex + 1);
    if (groupIndex < groups.length - 1) {
      const ng = groups[groupIndex + 1];
      const firstUnseen = ng.stories.findIndex((s) => !s.isViewedByMe);
      return goTo(groupIndex + 1, firstUnseen >= 0 ? firstUnseen : 0);
    }
    close();
  }, [group, groups, groupIndex, storyIndex, goTo, close]);

  const prev = useCallback(() => {
    if (storyIndex > 0) return goTo(groupIndex, storyIndex - 1);
    if (groupIndex > 0) return goTo(groupIndex - 1, groups[groupIndex - 1].stories.length - 1);
    goTo(groupIndex, storyIndex);
  }, [groups, groupIndex, storyIndex, goTo]);

  // Progress ticker: pauses while held, replying or viewing the viewers sheet; advances to the
  // next story when full. A story that expired while the viewer was open is skipped.
  useEffect(() => {
    if (!story || paused) return;
    const t = setInterval(() => {
      if (!isStoryActive(story)) {
        clearInterval(t);
        next();
        return;
      }
      progressValue.current = Math.min(1, progressValue.current + TICK_MS / currentDurationMs());
      setProgress(progressValue.current);
      if (progressValue.current >= 1) {
        clearInterval(t);
        next();
      }
    }, TICK_MS);
    return () => clearInterval(t);
  }, [story, paused, currentDurationMs, next]);

  // ── Record the view once per story (never for the author) ──────────────────
  useEffect(() => {
    if (!story || isOwn || viewedIds.current.has(story.id)) return;
    viewedIds.current.add(story.id);
    const storyId = story.id;
    storiesService
      .recordView(storyId, currentDurationMs() / 1000, true)
      .then(() =>
        setGroups((gs) =>
          gs.map((g) => ({
            ...g,
            stories: g.stories.map((s) => (s.id === storyId ? { ...s, isViewedByMe: true } : s)),
          }))
        )
      )
      .catch(() => {
        viewedIds.current.delete(storyId);
      });
  }, [story, isOwn, currentDurationMs]);

  // The author's counts in the Home list can be minutes old; re-read them when they open their story.
  useEffect(() => {
    if (!isOwn || !me.id) return;
    let cancelled = false;
    storiesService
      .getUserStories(Number(me.id))
      .then((fresh) => {
        if (cancelled) return;
        const byId = new Map(fresh.map((s) => [s.id, s]));
        setGroups((gs) =>
          gs.map((g) => ({
            ...g,
            stories: g.stories.map((s) => {
              const f = byId.get(s.id);
              return f ? { ...s, viewCount: f.viewCount, reactionCount: f.reactionCount } : s;
            }),
          }))
        );
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isOwn, me.id, story?.id]);

  // Follow state for the artist header button.
  useEffect(() => {
    if (!group || isOwn) return;
    let cancelled = false;
    followService
      .checkFollowStatus(group.userId)
      .then((f) => !cancelled && setFollowing(f))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [group, isOwn]);

  const showToast = (msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 1500);
  };
  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const patchStory = (id: number, patch: Partial<StoryItem>) =>
    setGroups((gs) => gs.map((g) => ({ ...g, stories: g.stories.map((s) => (s.id === id ? { ...s, ...patch } : s)) })));

  const handleReaction = async (emoji: string) => {
    if (!story || isOwn) return;
    const previous = story.myReaction ?? null;
    const removing = previous === emoji;
    patchStory(story.id, { myReaction: removing ? null : emoji });
    try {
      if (removing) {
        await storiesService.removeReaction(story.id);
        showToast("Reaction removed");
      } else {
        await storiesService.reactToStory(story.id, emoji);
        showToast(`Sent ${emoji}`);
      }
    } catch {
      patchStory(story.id, { myReaction: previous });
      showToast("Couldn't send reaction");
    }
  };

  const handleSendReply = async () => {
    const text = replyText.trim();
    if (!story || !text) return;
    setReplyText("");
    Keyboard.dismiss();
    setReplying(false);
    try {
      await storiesService.replyToStory(story.id, text);
      showToast("Reply sent");
    } catch {
      setReplyText(text);
      showToast("Couldn't send reply");
    }
  };

  const toggleFollow = async () => {
    if (!group || following === null) return;
    const nextState = !following;
    setFollowing(nextState);
    try {
      if (nextState) await followService.followUser(group.userId);
      else await followService.unfollowUser(group.userId);
    } catch {
      setFollowing(!nextState);
    }
  };

  const openViewers = async () => {
    if (!story) return;
    setViewersOpen(true);
    setViewersError(false);
    try {
      setViewers(await storiesService.getViewers(story.id));
    } catch {
      setViewersError(true);
    }
  };

  // Swipe down anywhere to close.
  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => g.dy > 12 && Math.abs(g.dy) > Math.abs(g.dx),
        onPanResponderRelease: (_, g) => {
          if (g.dy > 80) close();
        },
      }),
    [close]
  );

  const handlePressIn = () => {
    setHoldPaused(true);
    pressStartTime.current = Date.now();
  };
  const handlePressOut = (side: "left" | "right") => {
    setHoldPaused(false);
    if (Date.now() - pressStartTime.current < 300) {
      if (side === "left") prev();
      else next();
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading || loadError || !group || !story) {
    return (
      <View style={[styles.container, { alignItems: "center", justifyContent: "center" }]}>
        <StatusBar barStyle="light-content" />
        {loading ? (
          <ActivityIndicator size="large" color="#FFF" />
        ) : (
          <Text style={{ color: "#FFF", fontFamily: "Poppins-Medium", marginBottom: 16 }}>
            {loadError ?? "No stories available"}
          </Text>
        )}
        {!loading && (
          <TouchableOpacity style={styles.closeButton} onPress={close} accessibilityLabel="Close">
            <Ionicons name="close" size={22} color="#FFF" />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container} {...pan.panHandlers}>
      <StatusBar barStyle="light-content" />

      {/* Story media */}
      {story.mediaType === "VIDEO" ? (
        <VideoView player={player} style={styles.storyImage} contentFit="contain" nativeControls={false} />
      ) : (
        <Image
          key={story.id}
          source={{ uri: resolveImageUrl(story.mediaUrl) }}
          style={StyleSheet.absoluteFill}
          resizeMode="contain"
          onLoad={() => setLoadedMediaId(story.id)}
          onError={() => setFailedMediaId(story.id)}
        />
      )}
      {mediaPending && (
        <View style={styles.mediaStatus} pointerEvents="none">
          <ActivityIndicator size="large" color="#FFF" />
        </View>
      )}
      {story.mediaType !== "VIDEO" && failedMediaId === story.id && (
        <View style={styles.mediaStatus} pointerEvents="none">
          <Ionicons name="image-outline" size={40} color="rgba(255,255,255,0.7)" />
          <Text style={styles.mediaStatusText}>This story could not be loaded.</Text>
        </View>
      )}

      {/* Progress bars: one per story of this artist */}
      <View style={styles.progressContainer}>
        {group.stories.map((s, index) => {
          const fill = index < storyIndex ? 1 : index === storyIndex ? progress : 0;
          return (
            <View key={s.id} style={styles.progressBarBackground}>
              <View style={[styles.progressBarFilled, { width: `${fill * 100}%` }]} />
            </View>
          );
        })}
      </View>

      {/* Header */}
      <View style={styles.topHeader}>
        <Image source={avatarSource(group.userAvatar)} style={styles.profilePic} />
        <View style={styles.headerInfo}>
          <View style={styles.usernameRow}>
            <Text style={styles.username}>{group.username}</Text>
            {group.userRole === "ARTIST" && (
              <View style={styles.verifiedBadge}>
                <Svg width="14" height="14" viewBox="0 0 24 24" fill="#7126D0" stroke="#7126D0" strokeWidth="1">
                  <Path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </Svg>
              </View>
            )}
          </View>
          <Text style={styles.timeText}>{formatRelativeTime(story.createdAt)}</Text>
        </View>

        {!isOwn && following !== null && (
          <TouchableOpacity style={styles.mateButton} activeOpacity={0.8} onPress={toggleFollow}>
            <Text style={styles.mateText}>{following ? "Following" : "Follow"}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={close} style={{ marginLeft: 10 }} accessibilityLabel="Close" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close" size={26} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Tap left = previous, tap right = next, hold = pause */}
      <View style={styles.tapContainer}>
        <TouchableOpacity style={styles.tapLeft} activeOpacity={1} onPressIn={handlePressIn} onPressOut={() => handlePressOut("left")} />
        <TouchableOpacity style={styles.tapRight} activeOpacity={1} onPressIn={handlePressIn} onPressOut={() => handlePressOut("right")} />
      </View>

      {!!story.caption && (
        <View style={styles.captionBox} pointerEvents="none">
          <Text style={styles.captionText}>{story.caption}</Text>
        </View>
      )}

      {toast && (
        <View style={styles.toast} pointerEvents="none">
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}

      {isOwn ? (
        /* Author: views and the viewers sheet */
        <TouchableOpacity style={styles.ownerBar} onPress={openViewers} activeOpacity={0.85}>
          <Ionicons name="eye-outline" size={20} color="#FFF" />
          <Text style={styles.ownerBarText}>
            {story.viewCount} {story.viewCount === 1 ? "view" : "views"} · {story.reactionCount} {story.reactionCount === 1 ? "reaction" : "reactions"}
          </Text>
          <Ionicons name="chevron-up" size={16} color="#FFF" />
        </TouchableOpacity>
      ) : (
        /* Viewer: reactions and reply */
        <View style={styles.interactiveBottomBar}>
          {story.allowReactions && (
            <View style={styles.emojiQuickRow}>
              {STORY_REACTIONS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={[styles.emojiBubble, story.myReaction === emoji && styles.emojiBubbleSelected]}
                  onPress={() => handleReaction(emoji)}
                  activeOpacity={0.7}
                  accessibilityLabel={`React ${emoji}`}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {story.allowReplies && (
            <View style={styles.replyInputRow}>
              <TextInput
                style={styles.replyInput}
                placeholder={`Reply to ${group.username}...`}
                placeholderTextColor="rgba(255,255,255,0.7)"
                value={replyText}
                onChangeText={setReplyText}
                onFocus={() => setReplying(true)}
                onBlur={() => setReplying(false)}
                onSubmitEditing={handleSendReply}
                returnKeyType="send"
              />
              {replyText.trim().length > 0 && (
                <TouchableOpacity style={styles.sendReplyBtn} onPress={handleSendReply}>
                  <Ionicons name="send" size={16} color="#7126D0" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      )}

      {/* Author's viewers sheet */}
      {viewersOpen && (
        <View style={styles.analyticsDrawerOverlay}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setViewersOpen(false)} />
          <View style={styles.analyticsDrawerContent}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>Viewers ({viewers ? viewers.length : story.viewCount})</Text>
              <TouchableOpacity onPress={() => setViewersOpen(false)}>
                <Ionicons name="close" size={22} color="#111" />
              </TouchableOpacity>
            </View>
            {viewers === null && !viewersError ? (
              <ActivityIndicator color="#7126D0" style={{ marginVertical: 24 }} />
            ) : viewersError ? (
              <TouchableOpacity onPress={openViewers} style={{ paddingVertical: 24, alignItems: "center" }}>
                <Text style={styles.viewerTime}>Could not load viewers. Tap to retry.</Text>
              </TouchableOpacity>
            ) : viewers && viewers.length === 0 ? (
              <Text style={[styles.viewerTime, { textAlign: "center", paddingVertical: 24 }]}>No one has viewed this story yet.</Text>
            ) : (
              <ScrollView style={styles.viewersList} showsVerticalScrollIndicator={false}>
                {viewers!.map((v) => (
                  <View key={v.userId} style={styles.viewerRow}>
                    {v.avatar ? (
                      <Image source={avatarSource(v.avatar)} style={styles.viewerAvatarPlaceholder} />
                    ) : (
                      <View style={styles.viewerAvatarPlaceholder}>
                        <Text style={styles.viewerAvatarChar}>{(v.fullName || "?")[0]}</Text>
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.viewerName}>{v.fullName}</Text>
                      <Text style={styles.viewerTime}>{formatRelativeTime(v.viewedAt)}</Text>
                    </View>
                    {!!v.reaction && <Text style={{ fontSize: 16 }}>{v.reaction}</Text>}
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      )}

      {/* Other artists with stories */}
      {groups.length > 1 && !replying && (
        <View style={styles.bottomSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bottomScrollView}>
            {groups.map((g, i) => (
              <TouchableOpacity key={g.userId} style={styles.bottomStoryBubble} onPress={() => goTo(i, 0)} activeOpacity={0.9}>
                <View style={[styles.bottomImageRing, i === groupIndex && styles.bottomImageRingActive]}>
                  <Image source={avatarSource(g.userAvatar)} style={styles.bottomStoryImage} />
                </View>
                <Text style={styles.bottomStoryLabel} numberOfLines={1}>
                  {g.username}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default ProfileDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  storyImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
    position: "absolute",
  },
  progressContainer: {
    flexDirection: "row",
    paddingHorizontal: 12,
    position: "absolute",
    top: height * 0.055,
    left: 0,
    right: 0,
    zIndex: 11,
  },
  progressBarBackground: {
    flex: 1,
    height: 3,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginHorizontal: 2.5,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFilled: {
    height: "100%",
    backgroundColor: "#fff",
  },
  topHeader: {
    position: "absolute",
    top: height * 0.075,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: width * 0.04,
    zIndex: 10,
  },
  profilePic: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  headerInfo: {
    flex: 1,
    justifyContent: "center",
  },
  usernameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  username: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins-Bold",
  },
  verifiedBadge: {
    justifyContent: "center",
    alignItems: "center",
  },
  timeText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    marginTop: -2,
  },
  mateButton: {
    backgroundColor: "#F5F0FD",
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#7126D0",
  },
  mateText: {
    color: "#7126D0",
    fontSize: 16,
    fontFamily: "Poppins-Bold",
  },
  tapContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    zIndex: 1,
  },
  tapLeft: {
    flex: 3,
    height: "100%",
  },
  tapRight: {
    flex: 7,
    height: "100%",
  },
  rightActionsPanel: {
    position: "absolute",
    right: 16,
    top: height * 0.35,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    borderRadius: 30,
    paddingVertical: 18,
    paddingHorizontal: 10,
    alignItems: "center",
    zIndex: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  actionCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    // backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 4,
  },
  actionText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Poppins-Bold",
    marginTop: 2,
    marginBottom: 10,
  },
  bottomSection: {
    position: "absolute",
    bottom: height * 0.04,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  bottomScrollView: {
    paddingHorizontal: width * 0.04,
    paddingBottom: 8,
  },
  bottomStoryBubble: {
    alignItems: "center",
    marginHorizontal: 10,
    width: 70,
  },
  bottomImageRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2.5,
    borderColor: "rgba(255, 255, 255, 0.4)",
    padding: 2,
  },
  bottomImageRingActive: {
    borderColor: "#7126D0",
  },
  bottomStoryImage: {
    width: "100%",
    height: "100%",
    borderRadius: 27,
  },
  bottomStoryLabel: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Poppins-Medium",
    marginTop: 4,
    textAlign: "center",
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  storySticker: {
    position: "absolute",
    bottom: height * 0.2,
    left: width * 0.08,
    right: width * 0.22,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 24,
    zIndex: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  stickerIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#7126D0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  stickerTitle: {
    color: "#111",
    fontSize: 12,
    fontFamily: "Poppins-Bold",
  },
  stickerSub: {
    color: "#666",
    fontSize: 10,
    fontFamily: "Poppins-Medium",
  },
  interactiveBottomBar: {
    position: "absolute",
    bottom: height * 0.14,
    left: 16,
    right: 16,
    zIndex: 15,
  },
  emojiQuickRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  emojiBubble: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  emojiText: {
    fontSize: 20,
  },
  replyInputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderRadius: 22,
    paddingHorizontal: 14,
    height: 42,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  replyInput: {
    flex: 1,
    color: "#FFF",
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    paddingVertical: 0,
  },
  sendReplyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
  },
  analyticsDrawerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
    zIndex: 30,
  },
  analyticsDrawerContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: height * 0.6,
  },
  drawerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  drawerTitle: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: "#111",
  },
  analyticsStatsGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  analyticsStatBox: {
    flex: 1,
    backgroundColor: "#F5F0FD",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(113, 38, 208, 0.15)",
  },
  analyticsStatNumber: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: "#7126D0",
  },
  analyticsStatLabel: {
    fontSize: 10,
    fontFamily: "Poppins-Medium",
    color: "#666",
    marginTop: 2,
  },
  viewersSectionTitle: {
    fontSize: 13,
    fontFamily: "Poppins-Bold",
    color: "#333",
    marginBottom: 8,
  },
  viewersList: {
    maxHeight: 200,
  },
  viewerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  viewerAvatarPlaceholder: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#7126D0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  viewerAvatarChar: {
    color: "#FFF",
    fontSize: 14,
    fontFamily: "Poppins-Bold",
  },
  viewerName: {
    fontSize: 13,
    fontFamily: "Poppins-Bold",
    color: "#111",
  },
  viewerTime: {
    fontSize: 11,
    fontFamily: "Poppins-Regular",
    color: "#888",
  },
  emojiBubbleSelected: {
    backgroundColor: 'rgba(113, 38, 208, 0.6)',
    borderRadius: 16,
  },
  captionBox: {
    position: 'absolute',
    bottom: height * 0.3,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    zIndex: 12,
  },
  captionText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
  },
  toast: {
    position: 'absolute',
    top: height * 0.45,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    zIndex: 25,
  },
  toastText: {
    color: '#FFF',
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
  },
  mediaStatus: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  mediaStatusText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
  ownerBar: {
    position: 'absolute',
    bottom: height * 0.15,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    zIndex: 15,
  },
  ownerBarText: {
    color: '#FFF',
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
  },
});

import { ChatUser, Conversation, Message, ChatNotification, SharedMediaItem, SharedPostData } from '@/types/chatTypes';

// ─── Mock Users ──────────────────────────────────────────────────────────────

export const CURRENT_USER: ChatUser = {
  id: 'me',
  name: 'You',
  avatar: require('../assets/images/storyItem.jpg'),
  isOnline: true,
};

export const MOCK_USERS: ChatUser[] = [
  {
    id: 'u1',
    name: 'Kenny K Shot',
    avatar: require('../assets/images/feed6.jpg'),
    isOnline: true,
    lastSeen: new Date().toISOString(),
    bio: '🎤 Artist • Producer • Dreamer',
  },
  {
    id: 'u2',
    name: 'Ange Nadette',
    avatar: require('../assets/images/feed5.png'),
    isOnline: true,
    lastSeen: new Date().toISOString(),
    phone: '+250 788 000 001',
    bio: '✨ Fashion & Beauty Creator',
  },
  {
    id: 'u3',
    name: 'Drake',
    avatar: require('../assets/images/feed4.png'),
    isOnline: false,
    lastSeen: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    bio: '🦉 Certified Lover Boy',
  },
  {
    id: 'u4',
    name: 'The Weeknd',
    avatar: require('../assets/images/feed3.png'),
    isOnline: false,
    lastSeen: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    bio: '🌅 After Hours',
  },
  {
    id: 'u5',
    name: 'Emelyne',
    avatar: require('../assets/images/feed6.jpg'),
    isOnline: true,
    lastSeen: new Date().toISOString(),
    bio: '💖 Living my best life',
  },
  {
    id: 'u6',
    name: 'Justin Timberlake',
    avatar: require('../assets/images/feed3.png'),
    isOnline: false,
    lastSeen: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    bio: '🎵 Singer • Actor',
  },
  {
    id: 'u7',
    name: 'Rihanna',
    avatar: require('../assets/images/feed5.png'),
    isOnline: false,
    lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    bio: '💎 Fenty Beauty',
  },
  {
    id: 'u8',
    name: 'Travis Scott',
    avatar: require('../assets/images/feed4.png'),
    isOnline: true,
    lastSeen: new Date().toISOString(),
    bio: '🌵 UTOPIA',
  },
];

// ─── Mock Stories ────────────────────────────────────────────────────────────

export const MOCK_STORIES = [
  { id: 's0', name: 'Your Story', avatar: require('../assets/images/storyItem.jpg'), isSelf: true, hasStory: false },
  { id: 's1', name: 'Kenny', avatar: require('../assets/images/feed6.jpg'), isSelf: false, hasStory: true },
  { id: 's2', name: 'Ange', avatar: require('../assets/images/feed5.png'), isSelf: false, hasStory: true },
  { id: 's3', name: 'Drake', avatar: require('../assets/images/feed4.png'), isSelf: false, hasStory: true },
  { id: 's4', name: 'Weeknd', avatar: require('../assets/images/feed3.png'), isSelf: false, hasStory: false },
  { id: 's5', name: 'Travis', avatar: require('../assets/images/feed4.png'), isSelf: false, hasStory: true },
];

// ─── Mock Product Cards ──────────────────────────────────────────────────────

export const MOCK_PRODUCTS = [
  {
    id: 'p1',
    name: 'After Hours Hoodie',
    price: '$89.99',
    image: require('../assets/images/feed3.png'),
    artistName: 'The Weeknd',
    verified: true,
    description: 'Limited edition merch from the After Hours tour',
  },
  {
    id: 'p2',
    name: 'OVO Owl Cap',
    price: '$45.00',
    image: require('../assets/images/feed4.png'),
    artistName: 'Drake',
    verified: true,
    description: 'Classic OVO owl embroidered cap',
  },
];

// ─── Mock Conversations ──────────────────────────────────────────────────────

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'c1',
    type: 'direct',
    participants: [CURRENT_USER, MOCK_USERS[0]],
    lastMessage: {
      text: 'Did you check out the new drop?',
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      senderId: 'u1',
      type: 'text',
    },
    unreadCount: 3,
    isPinned: true,
    isMuted: false,
    isArchived: false,
    isFavorite: true,
    hasStory: true,
    isTyping: false,
  },
  {
    id: 'c2',
    type: 'direct',
    participants: [CURRENT_USER, MOCK_USERS[1]],
    lastMessage: {
      text: 'Love your new post! 🔥',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      senderId: 'u2',
      type: 'text',
    },
    unreadCount: 0,
    isPinned: false,
    isMuted: false,
    isArchived: false,
    isFavorite: true,
    hasStory: false,
    isTyping: false,
  },
  {
    id: 'c3',
    type: 'group',
    participants: [CURRENT_USER, MOCK_USERS[0], MOCK_USERS[1], MOCK_USERS[2]],
    lastMessage: {
      text: 'New album drops Friday!',
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      senderId: 'u2',
      type: 'text',
    },
    unreadCount: 12,
    isPinned: true,
    isMuted: false,
    isArchived: false,
    isFavorite: false,
    hasStory: false,
    isTyping: false,
    groupInfo: {
      name: 'Fan Club 🎶',
      avatar: require('../assets/images/feed6.jpg'),
      description: 'Official fan club chat for new drops and releases',
      adminIds: ['me', 'u1'],
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: 'me',
    },
  },
  {
    id: 'c4',
    type: 'direct',
    participants: [CURRENT_USER, MOCK_USERS[2]],
    lastMessage: {
      text: 'Certified 🦉',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      senderId: 'u3',
      type: 'text',
    },
    unreadCount: 1,
    isPinned: false,
    isMuted: false,
    isArchived: false,
    isFavorite: false,
    hasStory: true,
    isTyping: false,
  },
  {
    id: 'c5',
    type: 'direct',
    participants: [CURRENT_USER, MOCK_USERS[3]],
    lastMessage: {
      text: 'Blinding lights 🎵',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      senderId: 'u4',
      type: 'text',
    },
    unreadCount: 0,
    isPinned: false,
    isMuted: true,
    isArchived: false,
    isFavorite: false,
    hasStory: false,
    isTyping: false,
  },
  {
    id: 'c6',
    type: 'group',
    participants: [CURRENT_USER, MOCK_USERS[0], MOCK_USERS[1]],
    lastMessage: {
      text: 'Shipment confirmed ✅',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      senderId: 'me',
      type: 'text',
    },
    unreadCount: 0,
    isPinned: false,
    isMuted: false,
    isArchived: false,
    isFavorite: false,
    hasStory: false,
    isTyping: false,
    groupInfo: {
      name: 'Merch Team',
      avatar: require('../assets/images/feed5.png'),
      description: 'Coordinate merch drops and shipments',
      adminIds: ['me'],
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: 'me',
    },
  },
  {
    id: 'c7',
    type: 'direct',
    participants: [CURRENT_USER, MOCK_USERS[4]],
    lastMessage: {
      text: 'typing…',
      timestamp: new Date().toISOString(),
      senderId: 'u5',
      type: 'text',
    },
    unreadCount: 0,
    isPinned: false,
    isMuted: false,
    isArchived: false,
    isFavorite: false,
    hasStory: false,
    isTyping: true,
    typingUser: 'Emelyne',
  },
  {
    id: 'c8',
    type: 'direct',
    participants: [CURRENT_USER, MOCK_USERS[6]],
    lastMessage: {
      text: 'Check out this new Fenty product 💎',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      senderId: 'u7',
      type: 'product',
    },
    unreadCount: 0,
    isPinned: false,
    isMuted: false,
    isArchived: true,
    isFavorite: false,
    hasStory: false,
    isTyping: false,
  },
  {
    id: 'c9',
    type: 'direct',
    participants: [CURRENT_USER, MOCK_USERS[7]],
    lastMessage: {
      text: '🌵 UTOPIA merch live now!',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      senderId: 'u8',
      type: 'text',
    },
    unreadCount: 0,
    isPinned: false,
    isMuted: true,
    isArchived: true,
    isFavorite: false,
    hasStory: false,
    isTyping: false,
  },
];

// ─── Helper: get other user from a direct conversation ───────────────────────

export const getOtherUser = (conv: Conversation): ChatUser => {
  return conv.participants.find(p => p.id !== 'me') ?? conv.participants[0];
};

export const getConversationName = (conv: Conversation): string => {
  if (conv.type === 'group' && conv.groupInfo) return conv.groupInfo.name;
  return getOtherUser(conv).name;
};

export const getConversationAvatar = (conv: Conversation): any => {
  if (conv.type === 'group' && conv.groupInfo?.avatar) return conv.groupInfo.avatar;
  return getOtherUser(conv).avatar;
};

// ─── Mock Messages for each conversation ─────────────────────────────────────

const buildMsgs = (convId: string, msgs: Partial<Message>[]): Message[] =>
  msgs.map((m, i) => ({
    id: `${convId}-m${i + 1}`,
    conversationId: convId,
    senderId: m.senderId ?? 'me',
    senderName: m.senderName,
    type: m.type ?? 'text',
    text: m.text,
    imageUri: m.imageUri,
    videoUri: m.videoUri,
    voiceUri: m.voiceUri,
    voiceDuration: m.voiceDuration,
    document: m.document,
    linkPreview: m.linkPreview,
    product: m.product,
    sharedPost: m.sharedPost,
    stickerUri: m.stickerUri,
    gifUri: m.gifUri,
    systemText: m.systemText,
    timestamp: m.timestamp ?? new Date(Date.now() - (msgs.length - i) * 5 * 60 * 1000).toISOString(),
    readStatus: m.readStatus ?? 'read',
    replyTo: m.replyTo,
    reactions: m.reactions ?? [],
    isEdited: m.isEdited ?? false,
    isDeleted: m.isDeleted ?? false,
    isPinned: m.isPinned ?? false,
    isStarred: m.isStarred ?? false,
    mentions: m.mentions,
  }));

export const MOCK_MESSAGES: Record<string, Message[]> = {
  c1: buildMsgs('c1', [
    { senderId: 'u1', text: 'Hey! Saw your post about the drop 🔥', timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() },
    { senderId: 'me', text: 'Yes! It goes live at midnight 🚀', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), readStatus: 'read' },
    { senderId: 'u1', text: "Can't wait. Are you collaborating with anyone for this one?", timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000 + 60000).toISOString() },
    {
      senderId: 'me', text: 'Yeah, Kenny K Shot is on the track 🎤',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      readStatus: 'read',
      replyTo: { messageId: 'c1-m3', text: "Can't wait. Are you collaborating with anyone for this one?", sender: 'Kenny K Shot' },
    },
    { senderId: 'u1', type: 'image', imageUri: require('../assets/images/feed6.jpg'), timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
    { senderId: 'u1', text: 'This is my favourite 😍', timestamp: new Date(Date.now() - 28 * 60 * 1000).toISOString(), reactions: [{ emoji: '❤️', count: 1, reactedByMe: true }] },
    {
      senderId: 'u1', type: 'post', text: 'Check out this post!',
      sharedPost: {
        id: 1,
        userName: 'Kenny K Shot',
        userImage: require('../assets/images/storyItem.jpg'),
        timeAgo: '1h',
        verified: true,
        postText: 'This is the jacket i wore during the opening night of my Eras Tour in Los Angeles. It has so many crystals',
        mainImage: require('../assets/images/feed6.jpg'),
        price: '$250',
        likes: 15200,
        comments: 142,
        shares: 89,
        trending: '',
      },
      timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    },
    { senderId: 'me', text: '❤️', timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), readStatus: 'delivered' },
    {
      senderId: 'u1', type: 'product', text: 'Check this out!',
      product: MOCK_PRODUCTS[0],
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
    { senderId: 'u1', text: 'Did you check out the new drop?', timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(), isPinned: true },
  ]),
  c2: buildMsgs('c2', [
    { senderId: 'u2', text: 'Hey girl! 💕', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    { senderId: 'me', text: 'Heyyy! How are you?', timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(), readStatus: 'read' },
    { senderId: 'u2', text: 'Amazing! Did you see the new collection?', timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
    { senderId: 'u2', type: 'image', imageUri: require('../assets/images/feed5.png'), timestamp: new Date(Date.now() - 55 * 60 * 1000).toISOString() },
    {
      senderId: 'u2', type: 'link', text: 'https://celebstash.com/collection',
      linkPreview: { url: 'https://celebstash.com/collection', title: 'New Summer Collection', description: 'Exclusive celebrity fashion drops', domain: 'celebstash.com', image: require('../assets/images/feed5.png') },
      timestamp: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    },
    {
      senderId: 'me', type: 'post',
      sharedPost: {
        id: 3,
        userName: 'King Kivumbi',
        userImage: require('../assets/images/story2.png'),
        timeAgo: '3h',
        verified: true,
        postText: 'Check out my new collection drop — limited edition pieces available now. Grab yours before they sell out!',
        mainImage: require('../assets/images/feed7.png'),
        price: '$320',
        likes: 9800,
        comments: 94,
        shares: 41,
        trending: '#2 Trending',
      },
      timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
      readStatus: 'read',
    },
    { senderId: 'u2', text: 'OMG that drop is 🔥🔥🔥', timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString() },
    { senderId: 'me', text: 'Omg yes! Love your new post! 🔥', timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), readStatus: 'read', isStarred: true },
  ]),
  c3: buildMsgs('c3', [
    { senderId: 'me', type: 'system', systemText: 'You created this group', timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
    { senderId: 'u1', senderName: 'Kenny K Shot', text: 'Yo fam! 🎶', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
    { senderId: 'u2', senderName: 'Ange Nadette', text: 'Hey everyone!', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
    { senderId: 'u3', senderName: 'Drake', text: 'What\'s the plan for Friday?', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
    { senderId: 'me', text: 'Album drops at midnight EST', timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(), readStatus: 'read', mentions: ['u1'] },
    { senderId: 'u1', senderName: 'Kenny K Shot', text: '@You got it! 🔥', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), mentions: ['me'] },
    {
      senderId: 'u2', senderName: 'Ange Nadette', type: 'voice', voiceUri: 'voice_note_1', voiceDuration: 15,
      timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    },
    {
      senderId: 'u2', senderName: 'Ange Nadette', text: 'New album drops Friday!',
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      reactions: [{ emoji: '🔥', count: 3, reactedByMe: true }, { emoji: '🎶', count: 2, reactedByMe: false }],
    },
    {
      senderId: 'u3', senderName: 'Drake', type: 'product', product: MOCK_PRODUCTS[1],
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
  ]),
  c4: buildMsgs('c4', [
    { senderId: 'u3', text: 'What\'s good?', timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() },
    { senderId: 'me', text: 'Working on the new merch line', timestamp: new Date(Date.now() - 5.5 * 60 * 60 * 1000).toISOString(), readStatus: 'read' },
    { senderId: 'u3', text: 'Nice! Send me some samples', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
    {
      senderId: 'me', type: 'document',
      document: { name: 'Merch_Catalog_2026.pdf', size: '4.2 MB', type: 'pdf' },
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      readStatus: 'delivered',
    },
    { senderId: 'u3', text: 'Certified 🦉', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
  ]),
  c5: buildMsgs('c5', [
    { senderId: 'u4', text: 'Blinding lights 🎵', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
    { senderId: 'me', text: 'Love that track!', timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(), readStatus: 'read' },
  ]),
  c6: buildMsgs('c6', [
    { senderId: 'me', type: 'system', systemText: 'You created this group', timestamp: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() },
    { senderId: 'u1', senderName: 'Kenny K Shot', text: 'Orders are ready to ship!', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
    { senderId: 'u2', senderName: 'Ange Nadette', text: 'Tracking numbers sent via email', timestamp: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000).toISOString() },
    { senderId: 'me', text: 'Shipment confirmed ✅', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), readStatus: 'read' },
  ]),
  c7: buildMsgs('c7', [
    { senderId: 'u5', text: 'Hey! 💖', timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
    { senderId: 'me', text: 'Hi there!', timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(), readStatus: 'read' },
    { senderId: 'u5', text: 'How\'s your day going?', timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString() },
    { senderId: 'me', text: 'Pretty good! Just working on some new designs', timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), readStatus: 'read' },
  ]),
  c8: buildMsgs('c8', [
    { senderId: 'u7', text: 'Check out this new Fenty product 💎', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
    { senderId: 'u7', type: 'product', product: MOCK_PRODUCTS[0], timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 60000).toISOString() },
  ]),
  c9: buildMsgs('c9', [
    { senderId: 'u8', text: '🌵 UTOPIA merch live now!', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
    { senderId: 'u8', type: 'product', product: MOCK_PRODUCTS[1], timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 60000).toISOString() },
  ]),
};

// ─── Mock Shared Media ───────────────────────────────────────────────────────

export const getSharedMedia = (convId: string): SharedMediaItem[] => {
  const messages = MOCK_MESSAGES[convId] ?? [];
  const items: SharedMediaItem[] = [];
  messages.forEach(m => {
    if (m.type === 'image' && m.imageUri) {
      items.push({ id: m.id, type: 'photo', uri: m.imageUri, timestamp: m.timestamp });
    }
    if (m.type === 'video' && m.videoUri) {
      items.push({ id: m.id, type: 'video', uri: m.videoUri, timestamp: m.timestamp });
    }
    if (m.type === 'document' && m.document) {
      items.push({ id: m.id, type: 'document', document: m.document, title: m.document.name, size: m.document.size, timestamp: m.timestamp });
    }
    if (m.type === 'link' && m.linkPreview) {
      items.push({ id: m.id, type: 'link', linkPreview: m.linkPreview, title: m.linkPreview.title, timestamp: m.timestamp });
    }
    if (m.type === 'voice') {
      items.push({ id: m.id, type: 'voice', duration: m.voiceDuration, timestamp: m.timestamp });
    }
    if (m.type === 'product' && m.product) {
      items.push({ id: m.id, type: 'product', product: m.product, title: m.product.name, timestamp: m.timestamp });
    }
  });
  return items;
};

// ─── Mock Chat Notifications ─────────────────────────────────────────────────

export const MOCK_CHAT_NOTIFICATIONS: ChatNotification[] = [
  {
    id: 'cn1',
    type: 'new_message',
    fromUser: MOCK_USERS[0],
    conversationId: 'c1',
    message: 'Did you check out the new drop?',
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    isRead: false,
  },
  {
    id: 'cn2',
    type: 'message_reaction',
    fromUser: MOCK_USERS[1],
    conversationId: 'c2',
    message: 'reacted ❤️ to your message',
    reactionEmoji: '❤️',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    isRead: false,
  },
  {
    id: 'cn3',
    type: 'mention',
    fromUser: MOCK_USERS[0],
    conversationId: 'c3',
    message: 'mentioned you in Fan Club 🎶',
    groupName: 'Fan Club 🎶',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isRead: false,
  },
  {
    id: 'cn4',
    type: 'group_activity',
    fromUser: MOCK_USERS[2],
    conversationId: 'c3',
    message: 'joined Fan Club 🎶',
    groupName: 'Fan Club 🎶',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    isRead: true,
  },
  {
    id: 'cn5',
    type: 'missed_voice_call',
    fromUser: MOCK_USERS[2],
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    isRead: true,
  },
  {
    id: 'cn6',
    type: 'missed_video_call',
    fromUser: MOCK_USERS[4],
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
  },
];

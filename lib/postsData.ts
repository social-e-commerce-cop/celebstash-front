export interface ShoppableItem {
  type: 'product' | 'song' | 'concert';
  title: string;
  subtitle?: string;
  price?: string;
  image?: any;
}

export interface PostData {
  id: number;
  userName: string;
  userImage: any;
  timeAgo: string;
  verified: boolean;
  postText: string;
  mainImage: any;
  price: string;
  likes: number;
  likedByMe: boolean;
  comments: number;
  shares: number;
  trending: string;
  attachedItem?: ShoppableItem;
}

const postsData: PostData[] = [
  {
    id: 1,
    userName: 'Kenny K Shot',
    userImage: require('../assets/images/storyItem.jpg'),
    timeAgo: '1h',
    verified: true,
    postText: 'This is the jacket i wore during the opening night of my Eras Tour in Los Angeles. It has so many crystals',
    mainImage: require('../assets/images/feed6.jpg'),
    price: '$250',
    likes: 15200,
    likedByMe: true,
    comments: 142,
    shares: 89,
    trending: '',
    attachedItem: {
      type: 'product',
      title: 'Eras Tour Crystal Jacket',
      subtitle: 'Official Limited Edition Merch',
      price: '$250',
      image: require('../assets/images/feed6.jpg'),
    },
  },
  {
    id: 2,
    userName: 'Kenny K Shot',
    userImage: require('../assets/images/storyItem.jpg'),
    timeAgo: '1h',
    verified: true,
    postText: 'My new single "Ethereal Echoes" is out now! Stream it on Zikii Music or grab the vinyl drop.',
    mainImage: require('../assets/images/drop1.jpg'),
    price: '$18',
    likes: 15200,
    likedByMe: false,
    comments: 142,
    shares: 89,
    trending: '#1 Trending',
    attachedItem: {
      type: 'song',
      title: 'Ethereal Echoes (Single)',
      subtitle: 'Stream / Download • 3:45',
      price: '$18',
      image: require('../assets/images/drop1.jpg'),
    },
  },
  {
    id: 3,
    userName: 'King Kivumbi',
    userImage: require('../assets/images/story2.png'),
    timeAgo: '3h',
    verified: true,
    postText: 'Kigali World Tour live concert tickets are officially on sale! Tap below to lock in VIP front row access.',
    mainImage: require('../assets/images/feed7.png'),
    price: '$45',
    likes: 9800,
    likedByMe: false,
    comments: 94,
    shares: 41,
    trending: '#2 Trending',
    attachedItem: {
      type: 'concert',
      title: 'Kigali World Tour Live',
      subtitle: 'BK Arena • Aug 18, 2026',
      price: '$45 VIP',
      image: require('../assets/images/feed7.png'),
    },
  },
  {
    id: 4,
    userName: 'blue_buy',
    userImage: require('../assets/images/story3.png'),
    timeAgo: '5h',
    verified: false,
    postText: 'Just copped this fire piece at the exclusive artist drop event. The craftsmanship is unreal!',
    mainImage: require('../assets/images/feed3.png'),
    price: '$180',
    likes: 4400,
    likedByMe: false,
    comments: 28,
    shares: 12,
    trending: '',
  },
];

export default postsData;

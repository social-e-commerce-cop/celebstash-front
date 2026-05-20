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
  },
  {
    id: 2,
    userName: 'Kenny K Shot',
    userImage: require('../assets/images/storyItem.jpg'),
    timeAgo: '1h',
    verified: true,
    postText: 'This is the jacket i wore during the opening night of my Eras Tour in Los Angeles. It has so many crystals...',
    mainImage: require('../assets/images/feed6.jpg'),
    price: '$250',
    likes: 15200,
    likedByMe: false,
    comments: 142,
    shares: 89,
    trending: '#1 Trending',
  },
  {
    id: 3,
    userName: 'King Kivumbi',
    userImage: require('../assets/images/story2.png'),
    timeAgo: '3h',
    verified: true,
    postText: 'Check out my new collection drop — limited edition pieces available now. Grab yours before they sell out!',
    mainImage: require('../assets/images/feed7.png'),
    price: '$320',
    likes: 9800,
    likedByMe: false,
    comments: 94,
    shares: 41,
    trending: '#2 Trending',
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

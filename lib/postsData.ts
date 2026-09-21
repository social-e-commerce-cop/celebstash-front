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

// All mock posts removed — application uses exclusively live backend data
const postsData: PostData[] = [];

export default postsData;

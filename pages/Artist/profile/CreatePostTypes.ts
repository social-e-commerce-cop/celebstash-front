import { ProductItem } from '@/lib/productsService';

export interface SelectedMedia {
  id: string;
  uri: string;
  type: 'image' | 'video';
  name?: string;
}

export interface TaggedUser {
  id: number;
  fullName: string;
  username?: string;
  profilePicture?: string;
}

export interface CreatePostDraft {
  selectedMedia: SelectedMedia[];
  activeIndex: number;
  filterName: 'none' | 'warm' | 'cool' | 'bw';
  caption: string;
  taggedUsers: TaggedUser[];
  linkedProduct: ProductItem | null;
  isMultiSelect: boolean;
}

export const INITIAL_DRAFT: CreatePostDraft = {
  selectedMedia: [],
  activeIndex: 0,
  filterName: 'none',
  caption: '',
  taggedUsers: [],
  linkedProduct: null,
  isMultiSelect: true,
};

export type PostStep = 1 | 2 | 3 | 4;

export const PURPLE = '#7126D0';
export const LIGHT_PURPLE = '#F7F2FC';
export const BORDER_PURPLE = '#EAE0F8';

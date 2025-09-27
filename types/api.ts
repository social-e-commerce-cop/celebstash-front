// Enums matching backend
export enum AccountStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  ACTIVE = 'ACTIVE',
  LOCKED = 'LOCKED',
  DISABLED = 'DISABLED'
}

export enum ProductStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  DISCONTINUED = 'DISCONTINUED'
}

export enum ProductType {
  CLOTHING = 'CLOTHING',
  ACCESSORIES = 'ACCESSORIES',
  SHOES = 'SHOES',
  ELECTRONICS = 'ELECTRONICS',
  BEAUTY = 'BEAUTY',
  HOME = 'HOME',
  SPORTS = 'SPORTS',
  BOOKS = 'BOOKS',
  OTHER = 'OTHER'
}

// Authentication Types
export interface AuthRequest {
  identifier: string; // email or phone number
  password: string;
}

export interface SignupRequest {
  fullName: string;
  identifier: string; // email or phone number
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  userId: string;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  status: AccountStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  success: boolean;
  message?: string;
}

export interface OtpVerificationRequest {
  identifier: string;
  otp: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface PasswordResetRequest {
  identifier: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
}

// Product Types
export interface ProductResponse {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stockQuantity: number;
  status: ProductStatus;
  productType: ProductType;
  sellerId: number;
  sellerName: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  
  // Bidding related fields
  initialBidPrice?: number;
  currentBidPrice?: number;
  currentBidderId?: number;
  currentBidderName?: string;
  bidStartTime?: string;
  bidEndTime?: string;
  isBiddingActive: boolean;
  
  // Post information
  hasPost: boolean;
  postId?: number;
}

export interface ProductRequest {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stockQuantity: number;
  productType: ProductType;
}

// Cart Types
export interface CartItem {
  productId: number;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface CartResponse {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}

// Wallet Types
export interface WalletResponse {
  id: number;
  userId: number;
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TopUpRequest {
  amount: number;
  paymentMethod: string;
}

export interface TransactionResponse {
  id: number;
  walletId: number;
  type: 'TOP_UP' | 'PAYMENT' | 'REFUND' | 'WITHDRAWAL';
  amount: number;
  description: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

// API Error Types
export interface ApiError {
  message: string;
  status: number;
  timestamp: string;
  path: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationErrorResponse {
  message: string;
  errors: ValidationError[];
}

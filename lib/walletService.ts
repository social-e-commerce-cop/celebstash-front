import { apiClient } from './apiClient';

export interface WalletData {
  id: number;
  userId: number;
  userName?: string;
  balance: number;
  heldBalance: number;
  hasPinSet?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type BackendTxType =
  | 'DEPOSIT'
  | 'PURCHASE'
  | 'BID'
  | 'BID_REFUND'
  | 'PAYMENT'
  | 'WITHDRAWAL'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT';

export type BackendTxStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface TransactionData {
  id: number;
  walletId: number;
  amount: number;
  type: BackendTxType;
  status: BackendTxStatus;
  description?: string;
  productId?: number;
  productName?: string;
  createdAt: string;
  completedAt?: string;
}

export interface MomoTopUpPayload {
  amount: number;
  phoneNumber: string;
  provider: 'MTN' | 'Airtel' | string;
}

export interface WithdrawPayload {
  amount: number;
  destination: string;
  provider?: string;
  pin?: string;
}

export interface TransferPayload {
  amount: number;
  recipient: string;
  note?: string;
  pin?: string;
}

export interface DeductPayload {
  amount: number;
  description?: string;
  pin?: string;
}

export const walletService = {
  getWallet: async (): Promise<WalletData> => {
    return apiClient.get<WalletData>('/api/wallet');
  },

  topUp: async (amount: number, description = 'Wallet Top-Up'): Promise<WalletData> => {
    return apiClient.post<WalletData>('/api/wallet/top-up', { amount, description });
  },

  topUpWithMomo: async (payload: MomoTopUpPayload): Promise<WalletData> => {
    return apiClient.post<WalletData>('/api/wallet/top-up/momo', payload);
  },

  deduct: async (payload: DeductPayload): Promise<WalletData> => {
    return apiClient.post<WalletData>('/api/wallet/deduct', payload);
  },

  withdraw: async (payload: WithdrawPayload): Promise<WalletData> => {
    return apiClient.post<WalletData>('/api/wallet/withdraw', payload);
  },

  transfer: async (payload: TransferPayload): Promise<WalletData> => {
    return apiClient.post<WalletData>('/api/wallet/transfer', payload);
  },

  getTransactions: async (): Promise<TransactionData[]> => {
    return apiClient.get<TransactionData[]>('/api/wallet/transactions');
  },

  setPin: async (pin: string): Promise<WalletData> => {
    return apiClient.post<WalletData>('/api/wallet/pin', { pin });
  },

  getPinStatus: async (): Promise<{ hasPinSet: boolean }> => {
    return apiClient.get<{ hasPinSet: boolean }>('/api/wallet/pin/status');
  },

  verifyPin: async (pin: string): Promise<{ valid: boolean }> => {
    return apiClient.post<{ valid: boolean }>('/api/wallet/pin/verify', { pin });
  },
};

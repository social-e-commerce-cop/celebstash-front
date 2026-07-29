import { apiClient } from './apiClient';

export interface WalletData {
  id: number;
  userId: number;
  balance: number;
  createdAt: string;
  updatedAt?: string;
}

export interface TransactionData {
  id: number;
  walletId: number;
  amount: number;
  type: 'DEPOSIT' | 'PURCHASE' | 'BID' | 'BID_REFUND';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  description?: string;
  createdAt: string;
}

export const walletService = {
  getWallet: async () => {
    return apiClient.get<WalletData>('/api/wallet');
  },

  topUp: async (amount: number, description = 'Wallet Top-Up') => {
    return apiClient.post<WalletData>('/api/wallet/top-up', { amount, description });
  },

  getTransactions: async () => {
    return apiClient.get<TransactionData[]>('/api/wallet/transactions');
  },
};

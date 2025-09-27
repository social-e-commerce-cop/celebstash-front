import { apiClient } from './apiClient';
import { WalletResponse, TopUpRequest, TransactionResponse } from '../types/api';

class WalletService {
  // Get wallet information
  async getWalletInfo(): Promise<WalletResponse> {
    try {
      return await apiClient.get<WalletResponse>('/api/wallet');
    } catch (error) {
      console.error('Failed to fetch wallet info:', error);
      throw error;
    }
  }

  // Top up wallet
  async topUpWallet(topUpData: TopUpRequest): Promise<WalletResponse> {
    try {
      return await apiClient.post<WalletResponse>('/api/wallet/top-up', topUpData);
    } catch (error) {
      console.error('Failed to top up wallet:', error);
      throw error;
    }
  }

  // Get transaction history
  async getTransactionHistory(): Promise<TransactionResponse[]> {
    try {
      return await apiClient.get<TransactionResponse[]>('/api/wallet/transactions');
    } catch (error) {
      console.error('Failed to fetch transaction history:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const walletService = new WalletService();
export default walletService;

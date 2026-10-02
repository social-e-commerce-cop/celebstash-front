import { useState, useEffect } from 'react';
import { walletService, TransactionData, WalletData } from './walletService';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TransactionType =
  | 'top_up'
  | 'purchase'
  | 'refund'
  | 'promo'
  | 'withdrawal'
  | 'transfer_in'
  | 'transfer_out';

export type TransactionStatus = 'completed' | 'pending' | 'failed' | 'refunded';

export interface WalletTransaction {
  id: string;
  type: TransactionType;
  amount: number;       // always positive
  date: string;         // e.g. "July 7, 2026"
  time: string;         // e.g. "12:30 PM"
  status: TransactionStatus;
  description: string;
  orderId?: string;
  senderOrReceiver?: string;
  subtitle?: string;
  secondaryAmount?: string;
  direction?: 'up' | 'down';
}

interface WalletState {
  balance: number;
  heldBalance: number;
  totalToppedUp: number;
  totalSpent: number;
  hasPinSet: boolean;
  transactions: WalletTransaction[];
  isLoading: boolean;
  lastSyncedAt?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (isoString?: string): string => {
  const d = isoString ? new Date(isoString) : new Date();
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const formatTime = (isoString?: string): string => {
  const d = isoString ? new Date(isoString) : new Date();
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const mapBackendTxToFrontend = (tx: TransactionData): WalletTransaction => {
  let type: TransactionType = 'purchase';
  let direction: 'up' | 'down' = 'down';

  switch (tx.type) {
    case 'DEPOSIT':
      type = 'top_up';
      direction = 'down';
      break;
    case 'PURCHASE':
    case 'PAYMENT':
      type = 'purchase';
      direction = 'up';
      break;
    case 'BID':
      type = 'purchase';
      direction = 'up';
      break;
    case 'BID_REFUND':
      type = 'refund';
      direction = 'down';
      break;
    case 'WITHDRAWAL':
      type = 'withdrawal';
      direction = 'up';
      break;
    case 'TRANSFER_IN':
      type = 'transfer_in';
      direction = 'down';
      break;
    case 'TRANSFER_OUT':
      type = 'transfer_out';
      direction = 'up';
      break;
  }

  let status: TransactionStatus = 'completed';
  if (tx.status === 'PENDING') status = 'pending';
  else if (tx.status === 'FAILED') status = 'failed';
  else if (tx.status === 'REFUNDED') status = 'refunded';

  return {
    id: String(tx.id),
    type,
    amount: tx.amount,
    date: formatDate(tx.createdAt),
    time: formatTime(tx.createdAt),
    status,
    description: tx.description || 'Transaction',
    senderOrReceiver: tx.productName || tx.description || 'Wallet Transfer',
    subtitle: tx.status === 'COMPLETED' ? 'Completed' : tx.status,
    direction,
  };
};

// ─── Store State ──────────────────────────────────────────────────────────────

let walletState: WalletState = {
  balance: 0.00,
  heldBalance: 0.00,
  totalToppedUp: 0.00,
  totalSpent: 0.00,
  hasPinSet: false,
  transactions: [],
  isLoading: false,
};

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

// ─── Public API ───────────────────────────────────────────────────────────────

export const getWalletState = (): WalletState => ({ ...walletState });
export const getWalletBalance = (): number => walletState.balance;
export const getWalletHeldBalance = (): number => walletState.heldBalance;
export const getTotalToppedUp = (): number => walletState.totalToppedUp;
export const getTotalSpent = (): number => walletState.totalSpent;
export const getTransactions = (): WalletTransaction[] => [...walletState.transactions];

export const getTransactionById = (id: string): WalletTransaction | undefined =>
  walletState.transactions.find((t) => t.id === id);

/** Sync wallet & transactions from Spring Boot backend */
export const syncWalletFromBackend = async (): Promise<WalletState> => {
  try {
    walletState.isLoading = true;
    notify();

    const [walletData, txList] = await Promise.all([
      walletService.getWallet().catch(() => null),
      walletService.getTransactions().catch(() => null),
    ]);

    if (walletData && typeof walletData.balance === 'number') {
      walletState.balance = walletData.balance;
      walletState.heldBalance = walletData.heldBalance || 0;
      walletState.hasPinSet = !!walletData.hasPinSet;
    }

    if (Array.isArray(txList)) {
      const mapped = txList.map(mapBackendTxToFrontend);
      walletState.transactions = mapped;

      // Compute lifetime totals from real history
      let toppedUp = 0;
      let spent = 0;
      for (const t of mapped) {
        if (t.status === 'completed') {
          if (t.type === 'top_up' || t.type === 'transfer_in' || t.type === 'refund') {
            toppedUp += t.amount;
          } else if (t.type === 'purchase' || t.type === 'withdrawal' || t.type === 'transfer_out') {
            spent += t.amount;
          }
        }
      }
      walletState.totalToppedUp = +toppedUp.toFixed(2);
      walletState.totalSpent = +spent.toFixed(2);
    }

    walletState.lastSyncedAt = new Date().toISOString();
  } catch (e) {
    // Keep local cached state if backend is unreachable
  } finally {
    walletState.isLoading = false;
    notify();
  }
  return { ...walletState };
};

export const refreshWallet = async () => syncWalletFromBackend();

/** Add funds to the wallet via Card or generic Top-Up */
export const topUpWallet = async (
  amount: number,
  description?: string,
  cardLast4?: string
): Promise<WalletTransaction> => {
  const desc = description ?? `Wallet top-up${cardLast4 ? ` via card ending ${cardLast4}` : ''}`;

  try {
    const res = await walletService.topUp(amount, desc);
    walletState.balance = res.balance;
    await syncWalletFromBackend();
  } catch (err) {
    // Optimistic fallback
    walletState.balance = +(walletState.balance + amount).toFixed(2);
    walletState.totalToppedUp = +(walletState.totalToppedUp + amount).toFixed(2);
    notify();
  }

  const latest = walletState.transactions[0];
  return latest || {
    id: 'TXN-' + Date.now(),
    type: 'top_up',
    amount,
    date: formatDate(),
    time: formatTime(),
    status: 'completed',
    description: desc,
  };
};

/** Add funds to wallet via Mobile Money (MTN / Airtel Rwanda) */
export const topUpMomoWallet = async (
  amount: number,
  phoneNumber: string,
  provider: 'MTN' | 'Airtel' | string
): Promise<WalletTransaction> => {
  try {
    const res = await walletService.topUpWithMomo({ amount, phoneNumber, provider });
    walletState.balance = res.balance;
    await syncWalletFromBackend();
  } catch (err) {
    walletState.balance = +(walletState.balance + amount).toFixed(2);
    notify();
  }

  const latest = walletState.transactions[0];
  return latest || {
    id: 'MOMO-' + Date.now(),
    type: 'top_up',
    amount,
    date: formatDate(),
    time: formatTime(),
    status: 'completed',
    description: `MoMo top-up (${provider})`,
  };
};

/** Deduct funds from wallet on purchase with optional PIN */
export const deductWallet = async (
  amount: number,
  description: string,
  pin?: string
): Promise<WalletTransaction | null> => {
  if (walletState.balance < amount) return null;

  try {
    const res = await walletService.deduct({ amount, description, pin });
    walletState.balance = res.balance;
    await syncWalletFromBackend();
  } catch (err) {
    // If backend reports failure, throw to let caller show error message
    throw err;
  }

  const latest = walletState.transactions[0];
  return latest || null;
};

/** Withdraw funds to Mobile Money or Bank */
export const withdrawWallet = async (
  amount: number,
  destination: string,
  provider: string,
  pin?: string
): Promise<WalletTransaction> => {
  if (walletState.balance < amount) {
    throw new Error('Insufficient wallet balance');
  }

  const res = await walletService.withdraw({ amount, destination, provider, pin });
  walletState.balance = res.balance;
  await syncWalletFromBackend();

  return walletState.transactions[0];
};

/** P2P Transfer funds to another user */
export const transferWallet = async (
  amount: number,
  recipient: string,
  note?: string,
  pin?: string
): Promise<WalletTransaction> => {
  if (walletState.balance < amount) {
    throw new Error('Insufficient wallet balance');
  }

  const res = await walletService.transfer({ amount, recipient, note, pin });
  walletState.balance = res.balance;
  await syncWalletFromBackend();

  return walletState.transactions[0];
};

/** Credit a refund back to the wallet */
export const refundWallet = (amount: number, description: string, orderId?: string): WalletTransaction => {
  const txn: WalletTransaction = {
    id: 'REFUND-' + Date.now(),
    type: 'refund',
    amount,
    date: formatDate(),
    time: formatTime(),
    status: 'completed',
    description: description ?? `Refund for order ${orderId ?? ''}`,
    orderId,
  };

  walletState = {
    ...walletState,
    balance: +(walletState.balance + amount).toFixed(2),
    transactions: [txn, ...walletState.transactions],
  };

  notify();
  syncWalletFromBackend().catch(() => {});
  return txn;
};

// ─── React Hook ───────────────────────────────────────────────────────────────

export const useWallet = () => {
  const [state, setState] = useState<WalletState>(walletState);

  useEffect(() => {
    syncWalletFromBackend();
    const handleUpdate = () => setState({ ...walletState });
    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  return state;
};

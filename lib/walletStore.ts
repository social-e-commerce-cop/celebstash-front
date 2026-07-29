import { useState, useEffect } from 'react';
import { walletService } from './walletService';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TransactionType = 'top_up' | 'purchase' | 'refund' | 'promo';
export type TransactionStatus = 'completed' | 'pending' | 'failed';

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
  totalToppedUp: number;
  totalSpent: number;
  transactions: WalletTransaction[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (): string => {
  const now = new Date();
  return now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const formatTime = (): string => {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const generateId = (): string => 'TXN' + Date.now() + Math.floor(Math.random() * 1000);

// ─── State ────────────────────────────────────────────────────────────────────

let walletState: WalletState = {
  balance: 1250.50,
  totalToppedUp: 2000.00,
  totalSpent: 749.50,
  transactions: [
    {
      id: 'TXN_INITIAL',
      type: 'top_up',
      amount: 1250.50,
      date: 'Today',
      time: formatTime(),
      status: 'completed',
      description: 'Initial Wallet Balance',
      senderOrReceiver: 'System Credit',
      subtitle: 'Verified Account',
      direction: 'down',
    },
  ],
};

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

// ─── Public API ───────────────────────────────────────────────────────────────

export const getWalletState = (): WalletState => ({ ...walletState });
export const getWalletBalance = (): number => walletState.balance;
export const getTotalToppedUp = (): number => walletState.totalToppedUp;
export const getTotalSpent = (): number => walletState.totalSpent;
export const getTransactions = (): WalletTransaction[] => [...walletState.transactions];

export const getTransactionById = (id: string): WalletTransaction | undefined =>
  walletState.transactions.find((t) => t.id === id);

/** Sync wallet from backend */
export const syncWalletFromBackend = async () => {
  try {
    const backendWallet = await walletService.getWallet();
    if (backendWallet && typeof backendWallet.balance === 'number') {
      walletState.balance = backendWallet.balance;
      notify();
    }
  } catch (e) {
    // Silent fallback to local store if not logged in
  }
};

/** Add funds to the wallet after a successful top-up */
export const topUpWallet = (amount: number, description?: string, cardLast4?: string): WalletTransaction => {
  const desc = description ?? `Wallet top-up${cardLast4 ? ` via card ending ${cardLast4}` : ''}`;
  
  const txn: WalletTransaction = {
    id: generateId(),
    type: 'top_up',
    amount,
    date: formatDate(),
    time: formatTime(),
    status: 'completed',
    description: desc,
  };

  walletState = {
    ...walletState,
    balance: +(walletState.balance + amount).toFixed(2),
    totalToppedUp: +(walletState.totalToppedUp + amount).toFixed(2),
    transactions: [txn, ...walletState.transactions],
  };

  notify();

  // Async sync with Spring Boot backend
  walletService.topUp(amount, desc).catch(() => {
    // Fallback handled locally
  });

  return txn;
};

/** Deduct funds from the wallet on purchase */
export const deductWallet = (amount: number, description: string, orderId?: string): WalletTransaction | null => {
  if (walletState.balance < amount) return null; // Insufficient funds

  const txn: WalletTransaction = {
    id: generateId(),
    type: 'purchase',
    amount,
    date: formatDate(),
    time: formatTime(),
    status: 'completed',
    description,
    orderId,
  };

  walletState = {
    ...walletState,
    balance: +(walletState.balance - amount).toFixed(2),
    totalSpent: +(walletState.totalSpent + amount).toFixed(2),
    transactions: [txn, ...walletState.transactions],
  };

  notify();
  return txn;
};

/** Credit a refund back to the wallet */
export const refundWallet = (amount: number, description: string, orderId?: string): WalletTransaction => {
  const txn: WalletTransaction = {
    id: generateId(),
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
  return txn;
};

/** Add a promotional credit */
export const addPromoCredit = (amount: number, description: string): WalletTransaction => {
  const txn: WalletTransaction = {
    id: generateId(),
    type: 'promo',
    amount,
    date: formatDate(),
    time: formatTime(),
    status: 'completed',
    description,
  };

  walletState = {
    ...walletState,
    balance: +(walletState.balance + amount).toFixed(2),
    totalToppedUp: +(walletState.totalToppedUp + amount).toFixed(2),
    transactions: [txn, ...walletState.transactions],
  };

  notify();
  return txn;
};

// ─── React Hook ───────────────────────────────────────────────────────────────

export const useWallet = () => {
  const [state, setState] = useState<WalletState>(walletState);

  useEffect(() => {
    syncWalletFromBackend();
    const handleUpdate = () => setState({ ...walletState });
    listeners.add(handleUpdate);
    return () => { listeners.delete(handleUpdate); };
  }, []);

  return state;
};

import { useState, useEffect } from 'react';

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
  balance: 4405.00,
  totalToppedUp: 5937.00,
  totalSpent: 1532.00,
  transactions: [
    {
      id: 'TXN_ADA',
      type: 'purchase',
      amount: 1923,
      date: 'Nov 12',
      time: '12:30 PM',
      status: 'completed',
      description: 'Purchase payment for merchandise',
      senderOrReceiver: 'Purchased',
      subtitle: 'Sent by you • Nov 12',
      secondaryAmount: '$129.45',
      direction: 'up',
    },
    {
      id: 'TXN_MUSA',
      type: 'top_up',
      amount: 1532,
      date: 'Nov 14',
      time: '10:15 AM',
      status: 'completed',
      description: 'Wallet top-up via MTN MoMo (+250 788000000)',
      senderOrReceiver: 'Added money to your wallet',
      subtitle: 'Received by you • Nov 14',
      secondaryAmount: '$149.22',
      direction: 'down',
    },
    {
      id: 'TXN_NNEKA',
      type: 'purchase',
      amount: 950,
      date: 'Nov 12',
      time: '09:45 AM',
      status: 'completed',
      description: 'Purchase payment for premium song',
      senderOrReceiver: 'Purchased',
      subtitle: 'Sent by you • Nov 12',
      secondaryAmount: '$129.45',
      direction: 'up',
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

/** Add funds to the wallet after a successful top-up */
export const topUpWallet = (amount: number, description?: string, cardLast4?: string): WalletTransaction => {
  const txn: WalletTransaction = {
    id: generateId(),
    type: 'top_up',
    amount,
    date: formatDate(),
    time: formatTime(),
    status: 'completed',
    description: description ?? `Wallet top-up${cardLast4 ? ` via card ending ${cardLast4}` : ''}`,
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
    const handleUpdate = () => setState({ ...walletState });
    listeners.add(handleUpdate);
    return () => { listeners.delete(handleUpdate); };
  }, []);

  return state;
};

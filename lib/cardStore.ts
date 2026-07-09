import { useState, useEffect } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'unknown';

export interface SavedCard {
  id: string;
  holderName: string;
  maskedNumber: string; // '**** **** **** 1234'
  last4: string;
  brand: CardBrand;
  expiry: string;       // 'MM/YY'
  isDefault: boolean;
}

// ─── Luhn Algorithm ───────────────────────────────────────────────────────────

export const validateLuhn = (cardNumber: string): boolean => {
  const digits = cardNumber.replace(/\s/g, '');
  if (!/^\d{13,19}$/.test(digits)) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits[i], 10);
    if (shouldDouble) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
};

// ─── Card Brand Detection ─────────────────────────────────────────────────────

export const detectCardBrand = (cardNumber: string): CardBrand => {
  const digits = cardNumber.replace(/\s/g, '');
  if (/^4/.test(digits)) return 'visa';
  if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return 'mastercard';
  if (/^3[47]/.test(digits)) return 'amex';
  return 'unknown';
};

// ─── Mask Card Number ─────────────────────────────────────────────────────────

export const maskCardNumber = (cardNumber: string): string => {
  const digits = cardNumber.replace(/\s/g, '');
  const last4 = digits.slice(-4);
  const isAmex = detectCardBrand(digits) === 'amex';

  if (isAmex) {
    return `**** ****** *${last4}`;
  }
  return `**** **** **** ${last4}`;
};

// ─── State ────────────────────────────────────────────────────────────────────

let savedCards: SavedCard[] = [
  {
    id: 'card-1',
    holderName: 'Kenny K Shot',
    maskedNumber: '**** **** **** 4242',
    last4: '4242',
    brand: 'visa',
    expiry: '08/27',
    isDefault: true,
  },
  {
    id: 'card-2',
    holderName: 'Kenny K Shot',
    maskedNumber: '**** **** **** 5678',
    last4: '5678',
    brand: 'mastercard',
    expiry: '12/26',
    isDefault: false,
  },
];

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

// ─── Public API ───────────────────────────────────────────────────────────────

export const getCards = (): SavedCard[] => [...savedCards];

export const getDefaultCard = (): SavedCard | undefined =>
  savedCards.find((c) => c.isDefault);

export interface AddCardInput {
  holderName: string;
  cardNumber: string; // raw, will be masked — CVV never stored
  expiry: string;
  // cvv is validated locally but NEVER saved
}

export const addCard = (input: AddCardInput): SavedCard => {
  const digits = input.cardNumber.replace(/\s/g, '');
  const brand = detectCardBrand(digits);
  const last4 = digits.slice(-4);
  const hasDefault = savedCards.some((c) => c.isDefault);

  const newCard: SavedCard = {
    id: 'card-' + Date.now(),
    holderName: input.holderName,
    maskedNumber: maskCardNumber(digits),
    last4,
    brand,
    expiry: input.expiry,
    isDefault: !hasDefault, // first card becomes default automatically
  };

  savedCards = [...savedCards, newCard];
  notify();
  return newCard;
};

export const deleteCard = (id: string): void => {
  const wasDefault = savedCards.find((c) => c.id === id)?.isDefault;
  savedCards = savedCards.filter((c) => c.id !== id);

  // If deleted card was default, assign default to first remaining card
  if (wasDefault && savedCards.length > 0) {
    savedCards = savedCards.map((c, i) => ({ ...c, isDefault: i === 0 }));
  }

  notify();
};

export const setDefaultCard = (id: string): void => {
  savedCards = savedCards.map((c) => ({ ...c, isDefault: c.id === id }));
  notify();
};

// ─── React Hook ───────────────────────────────────────────────────────────────

export const useCards = () => {
  const [cards, setCards] = useState<SavedCard[]>(savedCards);

  useEffect(() => {
    const handleUpdate = () => setCards([...savedCards]);
    listeners.add(handleUpdate);
    return () => { listeners.delete(handleUpdate); };
  }, []);

  return cards;
};

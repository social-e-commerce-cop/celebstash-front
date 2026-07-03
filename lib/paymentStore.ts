import { useState, useEffect } from 'react';

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'card' | 'momo' | 'paypal';
  detail: string; // e.g. email, masked number, or phone number
  provider: 'mtn' | 'airtel' | 'visa' | 'mastercard' | 'paypal';
}

let activeMethods: PaymentMethod[] = [
  { id: '1', name: 'Visa', type: 'card', detail: '**** **** *** *567', provider: 'visa' },
  { id: '2', name: 'Mastercard', type: 'card', detail: '**** **** **** *123', provider: 'mastercard' },
  { id: '3', name: 'MTN MoMo', type: 'momo', detail: '+250 788 000 000', provider: 'mtn' },
  { id: '4', name: 'Airtel Money', type: 'momo', detail: '+250 722 000 000', provider: 'airtel' },
  { id: '5', name: 'PayPal', type: 'paypal', detail: 'user@paypal.com', provider: 'paypal' }
];

const listeners = new Set<() => void>();

export const getPaymentMethods = () => activeMethods;

export const addPaymentMethod = (method: Omit<PaymentMethod, 'id'>) => {
  const newMethod: PaymentMethod = {
    id: String(Date.now()),
    ...method,
  };
  activeMethods = [...activeMethods, newMethod];
  listeners.forEach(l => l());
};

export const usePaymentMethods = () => {
  const [methods, setMethods] = useState<PaymentMethod[]>(activeMethods);

  useEffect(() => {
    const handleUpdate = () => {
      setMethods(activeMethods);
    };
    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  return methods;
};

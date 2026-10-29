import { useEffect, useState } from 'react';
import { cartService, CartResponseData, AddToCartOptions } from './cartService';
import { subscribeSession, isAuthenticated } from './session';
import { syncWalletFromBackend } from './walletStore';

/**
 * Shared cart state. The backend cart (/api/cart) is the source of truth: every screen reads
 * from this store, and the store only ever holds what the server last returned. Nothing is added
 * locally before the server confirms it, so a failed request can never show a phantom item.
 */
export interface CartState {
  cart: CartResponseData | null;
  loading: boolean;
  error: string | null;
  /** productIds with a mutation in flight, so their buttons can be disabled. */
  pending: number[];
}

let state: CartState = { cart: null, loading: false, error: null, pending: [] };
const listeners = new Set<() => void>();

const setState = (patch: Partial<CartState>) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
};

// Every request takes a sequence number; a response is only applied if no newer request has
// completed since it started. This stops a slow, stale response (e.g. an initial GET) from
// overwriting the result of a newer mutation.
let requestSeq = 0;
let appliedSeq = 0;

const apply = (seq: number, cart: CartResponseData) => {
  if (seq < appliedSeq) return;
  appliedSeq = seq;
  setState({ cart, error: null });
};

const errorMessage = (err: any, fallback: string) =>
  (err && typeof err.message === 'string' && err.message) || fallback;

export const getCartState = () => state;

export const refreshCart = async (): Promise<CartResponseData | null> => {
  if (!isAuthenticated()) {
    setState({ cart: null, loading: false, error: null });
    return null;
  }
  const seq = ++requestSeq;
  setState({ loading: true });
  try {
    const cart = await cartService.getCart();
    apply(seq, cart);
    return cart;
  } catch (err: any) {
    if (seq >= appliedSeq) setState({ error: errorMessage(err, 'Could not load your cart.') });
    throw err;
  } finally {
    setState({ loading: false });
  }
};

const mutate = async (
  productId: number,
  call: () => Promise<CartResponseData>,
): Promise<CartResponseData> => {
  if (state.pending.includes(productId)) {
    throw new Error('Please wait — your previous change to this item is still being saved.');
  }
  const seq = ++requestSeq;
  setState({ pending: [...state.pending, productId] });
  try {
    const cart = await call();
    apply(seq, cart);
    // Cart changes move money in and out of the wallet's escrow hold.
    syncWalletFromBackend().catch(() => {});
    return cart;
  } finally {
    setState({ pending: state.pending.filter((id) => id !== productId) });
  }
};

/** Adds a product. Resolves with the server's cart; rejects (with the server's message) on failure. */
export const addToCart = (productId: number, options: AddToCartOptions = {}) =>
  mutate(productId, () => cartService.addToCart(productId, options));

export const updateCartQuantity = (productId: number, quantity: number) =>
  mutate(productId, () => cartService.updateQuantity(productId, quantity));

export const removeFromCart = (productId: number) =>
  mutate(productId, () => cartService.removeFromCart(productId));

/** Called after an order consumed the cart on the server. */
export const markCartConsumed = () => {
  appliedSeq = ++requestSeq;
  setState({ cart: state.cart ? { ...state.cart, items: [], totalItems: 0, totalPrice: 0 } : null });
  refreshCart().catch(() => {});
};

// A different account must never see the previous account's cart.
subscribeSession((event) => {
  appliedSeq = ++requestSeq;
  setState({ cart: null, error: null, pending: [] });
  if (event === 'signedIn') {
    refreshCart().catch(() => {});
  }
});

export const useCart = (options: { refreshOnMount?: boolean } = {}) => {
  const [snapshot, setSnapshot] = useState<CartState>(state);

  useEffect(() => {
    const update = () => setSnapshot(state);
    listeners.add(update);
    if (options.refreshOnMount !== false) {
      refreshCart().catch(() => {});
    }
    return () => {
      listeners.delete(update);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return snapshot;
};

/** Number of units in the cart, for badges. */
export const useCartCount = () => {
  const { cart } = useCart({ refreshOnMount: !state.cart });
  return cart?.totalItems ?? 0;
};

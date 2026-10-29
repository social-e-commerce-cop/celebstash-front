import { apiClient } from './apiClient';

export type DeliveryOption = 'SELF_PICKUP' | 'DELIVERY';

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'PROCESSING'
  | 'READY_FOR_PICKUP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface OrderItemResponse {
  id: number;
  productId: number;
  productName: string;
  productImageUrl?: string | null;
  price: number;
  quantity: number;
  subtotal: number;
  notes?: string | null;
}

export interface LocationResponse {
  id: number;
  name: string;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  deliveryFee: number;
  active?: boolean;
}

export interface OrderResponse {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  deliveryOption: DeliveryOption;
  location?: LocationResponse | null;
  subtotal: number;
  deliveryFee: number;
  total: number;
  notes?: string | null;
  items: OrderItemResponse[];
  itemCount: number;
  createdAt: string;
  paidAt?: string | null;
  completedAt?: string | null;
}

/** Order payload. The server prices the order from the cart; no amounts are sent. */
export interface CreateOrderPayload {
  deliveryOption: DeliveryOption;
  locationId?: number;
  notes?: string;
  payNow: boolean;
  pin?: string;
}

export interface CreateLocationPayload {
  name: string;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
}

export const ordersService = {
  /** Creates an order from the server-side cart and, with payNow, pays it from the wallet. */
  createOrder: (payload: CreateOrderPayload) => apiClient.post<OrderResponse>('/api/orders', payload),

  getMyOrders: (page = 0, size = 20) =>
    apiClient.get<Page<OrderResponse>>(`/api/orders?page=${page}&size=${size}&sort=createdAt,desc`),

  getOrder: (id: number) => apiClient.get<OrderResponse>(`/api/orders/${id}`),

  payOrder: (id: number, pin: string) =>
    apiClient.post<OrderResponse>(`/api/orders/${id}/payment`, { orderId: id, pin }),

  cancelOrder: (id: number) => apiClient.post<OrderResponse>(`/api/orders/${id}/cancel`),

  getMyActiveLocations: () => apiClient.get<LocationResponse[]>('/api/locations/active'),

  /** Saves a delivery address. The delivery fee is decided by the server. */
  createLocation: (payload: CreateLocationPayload) =>
    apiClient.post<LocationResponse>('/api/locations', payload),
};

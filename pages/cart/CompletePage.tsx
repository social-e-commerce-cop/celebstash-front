import React, { useCallback, useState } from 'react';
import {
  ScrollView, View, Text, StyleSheet, Dimensions, ActivityIndicator, TouchableOpacity, Alert, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import OrderCard from '@/components/cart/OrderCard';
import { ordersService, OrderResponse, OrderStatus } from '@/lib/ordersService';
import { resolveImageUrl } from '@/lib/apiClient';
import { isAuthenticated } from '@/lib/session';
import { refreshCart } from '@/lib/cartStore';
import { syncWalletFromBackend } from '@/lib/walletStore';

const { width } = Dimensions.get('window');
const GREEN = '#32A06E';
const PURPLE = '#7126D0';
const PLACEHOLDER = require('../../assets/images/products/product1.jpg');

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'Awaiting payment',
  PAID: 'Paid',
  PROCESSING: 'Processing',
  READY_FOR_PICKUP: 'Ready for pickup',
  OUT_FOR_DELIVERY: 'Out for delivery',
  DELIVERED: 'Delivered',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const fmt = (n: number | undefined | null) => `$${Number(n ?? 0).toFixed(2)}`;
const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '';

const CompletePage = () => {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const loadOrders = useCallback(async () => {
    if (!isAuthenticated()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const page = await ordersService.getMyOrders();
      setOrders(page?.content ?? []);
    } catch (err: any) {
      setError(err?.message || 'Could not load your orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Orders change status on the server (payment, fulfilment); reload whenever the tab is shown.
  useFocusEffect(useCallback(() => { loadOrders(); }, [loadOrders]));

  const showDetails = (order: OrderResponse) => {
    const lines = order.items
      .map(i => `• ${i.productName} × ${i.quantity} — ${fmt(i.subtotal)}${i.notes ? ` (${i.notes})` : ''}`)
      .join('\n');
    Alert.alert(
      `Order ${order.orderNumber}`,
      `${lines}\n\nSubtotal: ${fmt(order.subtotal)}\nDelivery: ${fmt(order.deliveryFee)}\nTotal: ${fmt(order.total)}\n\nStatus: ${STATUS_LABEL[order.status] ?? order.status}`,
    );
  };

  const cancelOrder = (order: OrderResponse) => {
    Alert.alert('Cancel order?', `Order ${order.orderNumber} will be cancelled and its reservations released.`, [
      { text: 'Keep order', style: 'cancel' },
      {
        text: 'Cancel order',
        style: 'destructive',
        onPress: async () => {
          setCancellingId(order.id);
          try {
            await ordersService.cancelOrder(order.id);
            await loadOrders();
            refreshCart().catch(() => {});
            syncWalletFromBackend().catch(() => {});
          } catch (err: any) {
            Alert.alert('Could not cancel', err?.message || 'Please try again.');
          } finally {
            setCancellingId(null);
          }
        },
      },
    ]);
  };

  if (!isAuthenticated()) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>Sign in to see your orders</Text>
      </View>
    );
  }

  if (loading && orders.length === 0) {
    return (
      <View style={styles.empty}>
        <ActivityIndicator color={PURPLE} />
      </View>
    );
  }

  if (error && orders.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>Could not load your orders</Text>
        <Text style={styles.emptySub}>{error}</Text>
        <TouchableOpacity onPress={loadOrders} style={styles.retryBtn}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadOrders} />}
      >
        {orders.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptySub}>Orders you place from your cart appear here.</Text>
          </View>
        )}

        {orders.map(order => {
          const first = order.items[0];
          const extra = order.items.length > 1 ? ` +${order.items.length - 1} more` : '';
          const isPending = order.status === 'PENDING_PAYMENT';
          const isCancelled = order.status === 'CANCELLED';
          return (
            <View key={order.id}>
              <OrderCard
                imageSource={first?.productImageUrl ? { uri: resolveImageUrl(first.productImageUrl) } : PLACEHOLDER}
                title={`${first?.productName ?? 'Order'}${extra}`}
                subtitle={`Order ${order.orderNumber}`}
                status={STATUS_LABEL[order.status] ?? order.status}
                price={fmt(order.total)}
                buttonText={isPending ? (cancellingId === order.id ? 'Cancelling…' : 'Cancel') : 'Details'}
                onButtonPress={() => (isPending ? cancellingId === null && cancelOrder(order) : showDetails(order))}
                statusPillStyle={isCancelled ? styles.cancelledPill : isPending ? undefined : styles.completedPill}
                statusTextStyle={isCancelled ? styles.cancelledPillText : isPending ? undefined : styles.completedPillText}
              />
              <Text style={styles.orderDate}>
                {order.paidAt ? `Paid ${fmtDate(order.paidAt)}` : `Placed ${fmtDate(order.createdAt)}`}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: width * 0.045,
    color: '#333',
    marginBottom: 8,
    fontFamily: 'Poppins-Bold',
  },
  emptySub: {
    fontSize: 14,
    color: '#888',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 16,
    backgroundColor: PURPLE,
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  retryText: {
    color: '#fff',
    fontFamily: 'Poppins-Bold',
  },
  orderDate: {
    fontSize: 14,
    color: '#AAA',
    marginTop: -10,
    marginBottom: 12,
    paddingLeft: 4,
    fontFamily: 'Poppins-Bold',
  },
  completedPill: {
    backgroundColor: '#EAF7F2',
    borderColor: '#B6E8D4',
  },
  completedPillText: {
    color: GREEN,
  },
  cancelledPill: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  cancelledPillText: {
    color: '#991B1B',
  },
});

export default CompletePage;

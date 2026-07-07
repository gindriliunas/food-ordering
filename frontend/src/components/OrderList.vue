<script setup lang="ts">
import type { Order } from '../types/order';

defineProps<{
  orders: Order[];
  loading: boolean;
  deletingId: string | null;
}>();

const emit = defineEmits<{
  delete: [id: string];
}>();

const statusLabel: Record<Order['status'], string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  FAILED: 'Failed',
};
</script>

<template>
  <section class="card orders-card">
    <div class="section-heading">
      <div>
        <p class="eyebrow">Live orders</p>
        <h2>Kitchen requests</h2>
      </div>
      <span class="count">{{ orders.length }}</span>
    </div>

    <p v-if="loading" class="muted">Loading orders...</p>
    <p v-else-if="orders.length === 0" class="muted">No orders yet. Create the first one.</p>

    <article v-for="order in orders" v-else :key="order.id" class="order">
      <div>
        <strong>{{ order.items[0]?.name ?? 'Order' }}</strong>
        <p>{{ order.items[0]?.quantity }} {{ order.items[0]?.unit }} · {{ order.kitchenId }}</p>
        <p v-if="order.deliveryAddress" class="address">{{ order.deliveryAddress }}</p>
        <small>{{ order.id }}</small>
      </div>
      <div class="order-actions">
        <span class="status" :class="order.status.toLowerCase()">
          {{ statusLabel[order.status] }}
        </span>
        <button
          type="button"
          class="icon-btn delete-btn"
          :disabled="deletingId === order.id"
          :aria-label="`Delete order for ${order.items[0]?.name ?? 'order'}`"
          @click="emit('delete', order.id)"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M7 4V2h10v2h5v2H2V4h5zM6 8h12l-1 12H7L6 8zm3 3v7h2v-7H9zm4 0v7h2v-7h-2z"
            />
          </svg>
        </button>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import type { Order } from '../types/order';

defineProps<{
  orders: Order[];
  loading: boolean;
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
        <small>{{ order.id }}</small>
      </div>
      <span class="status" :class="order.status.toLowerCase()">
        {{ statusLabel[order.status] }}
      </span>
    </article>
  </section>
</template>

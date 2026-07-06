<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import OrderForm from './components/OrderForm.vue';
import OrderList from './components/OrderList.vue';
import { OrdersApi } from './services/ordersApi';
import type { CreateOrderPayload, Order } from './types/order';

const token = ref(localStorage.getItem('food-ordering-token') ?? '');
const orders = ref<Order[]>([]);
const loading = ref(false);
const saving = ref(false);
const error = ref('');
const success = ref('');

const api = computed(() => new OrdersApi(token.value));
const hasToken = computed(() => token.value.trim().length > 0);

function saveToken() {
  localStorage.setItem('food-ordering-token', token.value.trim());
  success.value = 'Token saved. You can now call the API.';
  void refreshOrders();
}

async function refreshOrders() {
  if (!hasToken.value) {
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    orders.value = await api.value.listOrders();
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load orders';
  } finally {
    loading.value = false;
  }
}

async function createOrder(payload: CreateOrderPayload) {
  if (!hasToken.value) {
    error.value = 'Paste a JWT first.';
    return;
  }

  saving.value = true;
  error.value = '';
  success.value = '';

  try {
    const order = await api.value.createOrder(payload);
    success.value = `Order ${order.id} created. Worker confirmation runs asynchronously.`;
    await refreshOrders();
    window.setTimeout(() => void refreshOrders(), 3000);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to create order';
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  void refreshOrders();
});
</script>

<template>
  <main class="shell">
    <section class="hero">
      <div>
        <p class="eyebrow">Collectiv Food interview project</p>
        <h1>Serverless kitchen ordering</h1>
        <p>
          Vue.js frontend calling a TypeScript AWS Lambda API with DynamoDB, SNS, SQS,
          Terraform, and JWT authentication.
        </p>
      </div>
      <button :disabled="loading || !hasToken" @click="refreshOrders">
        {{ loading ? 'Refreshing...' : 'Refresh orders' }}
      </button>
    </section>

    <section class="card token-card">
      <div>
        <p class="eyebrow">Authentication</p>
        <h2>Paste demo JWT</h2>
        <p class="muted">
          Generate one with <code>node scripts/generate-token.js demo-kitchen</code>.
        </p>
      </div>
      <textarea v-model="token" rows="3" placeholder="Bearer token value"></textarea>
      <button @click="saveToken">Save token</button>
    </section>

    <p v-if="error" class="alert error">{{ error }}</p>
    <p v-if="success" class="alert success">{{ success }}</p>

    <div class="grid">
      <OrderForm @submit="createOrder" />
      <OrderList :orders="orders" :loading="loading || saving" />
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import LoginForm from './components/LoginForm.vue';
import OrderForm from './components/OrderForm.vue';
import OrderList from './components/OrderList.vue';
import SupplyTimeline from './components/SupplyTimeline.vue';
import {
  getCurrentSessionToken,
  parseKitchenIdFromToken,
  signOut,
} from './services/cognitoAuth';
import { OrdersApi } from './services/ordersApi';
import type { CreateOrderPayload, Order } from './types/order';

const token = ref<string | null>(null);
const kitchenId = ref('');
const orders = ref<Order[]>([]);
const loading = ref(false);
const saving = ref(false);
const deletingId = ref<string | null>(null);
const error = ref('');
const success = ref('');

const orderPreview = ref<CreateOrderPayload>({
  items: [{ name: 'Tomatoes', quantity: 10, unit: 'kg' }],
  deliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  deliveryAddress: '12 Kitchen Lane, London, E1 6AN',
});

const isAuthenticated = computed(() => Boolean(token.value));
const api = computed(() => new OrdersApi(token.value ?? ''));

async function loadSession() {
  try {
    const sessionToken = await getCurrentSessionToken();
    token.value = sessionToken;
    if (sessionToken) {
      kitchenId.value = parseKitchenIdFromToken(sessionToken);
    }
  } catch {
    token.value = null;
  }
}

async function handleAuthenticated() {
  await loadSession();
  await refreshOrders();
}

function handleSignOut() {
  signOut();
  token.value = null;
  kitchenId.value = '';
  orders.value = [];
  success.value = 'Signed out.';
  error.value = '';
}

async function refreshOrders() {
  if (!token.value) {
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
  if (!token.value) {
    error.value = 'Please sign in first.';
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

async function deleteOrder(id: string) {
  if (!token.value) {
    return;
  }

  deletingId.value = id;
  error.value = '';
  success.value = '';

  try {
    await api.value.deleteOrder(id);
    orders.value = orders.value.filter((order) => order.id !== id);
    success.value = 'Order removed.';
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to delete order';
  } finally {
    deletingId.value = null;
  }
}

onMounted(() => {
  void loadSession().then(() => {
    if (token.value) {
      void refreshOrders();
    }
  });
});
</script>

<template>
  <main class="shell">
    <section class="hero">
      <div>
        <p class="eyebrow">Food ordering project</p>
        <h1>Serverless kitchen ordering</h1>
      </div>
      <div v-if="isAuthenticated" class="hero-actions">
        <p class="muted signed-in">
          Signed in{{ kitchenId ? ` as ${kitchenId}` : '' }}
        </p>
        <button :disabled="loading" @click="refreshOrders">
          {{ loading ? 'Refreshing...' : 'Refresh orders' }}
        </button>
        <button class="secondary" @click="handleSignOut">Sign out</button>
      </div>
    </section>

    <LoginForm v-if="!isAuthenticated" @authenticated="handleAuthenticated" />

    <template v-else>
      <p v-if="error" class="alert error">{{ error }}</p>
      <p v-if="success" class="alert success">{{ success }}</p>

      <div class="grid">
        <OrderForm @submit="createOrder" @preview-change="orderPreview = $event" />
        <OrderList
          :orders="orders"
          :loading="loading || saving"
          :deleting-id="deletingId"
          @delete="deleteOrder"
        />
      </div>

      <SupplyTimeline
        :ingredient="orderPreview.items[0]?.name ?? 'Tomatoes'"
        :delivery-date="orderPreview.deliveryDate"
        :delivery-address="orderPreview.deliveryAddress"
      />
    </template>
  </main>
</template>

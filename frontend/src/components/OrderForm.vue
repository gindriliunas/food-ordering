<script setup lang="ts">
import { reactive, ref } from 'vue';
import type { CreateOrderPayload, OrderItem } from '../types/order';

const emit = defineEmits<{
  submit: [payload: CreateOrderPayload];
}>();

const item = reactive<OrderItem>({
  name: 'Tomatoes',
  quantity: 10,
  unit: 'kg',
});

const deliveryDate = ref(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16));

function submitOrder() {
  emit('submit', {
    items: [
      {
        name: item.name.trim(),
        quantity: Number(item.quantity),
        unit: item.unit.trim(),
      },
    ],
    deliveryDate: new Date(deliveryDate.value).toISOString(),
  });
}
</script>

<template>
  <form class="card order-form" @submit.prevent="submitOrder">
    <div>
      <p class="eyebrow">Create order</p>
      <h2>Ingredient request</h2>
    </div>

    <label>
      Ingredient
      <input v-model="item.name" required placeholder="Tomatoes" />
    </label>

    <div class="row">
      <label>
        Quantity
        <input v-model.number="item.quantity" required type="number" min="1" step="1" />
      </label>

      <label>
        Unit
        <input v-model="item.unit" required placeholder="kg" />
      </label>
    </div>

    <label>
      Delivery date
      <input v-model="deliveryDate" required type="datetime-local" />
    </label>

    <button type="submit">Place order</button>
  </form>
</template>

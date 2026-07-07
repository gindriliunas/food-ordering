<script setup lang="ts">
import { reactive, ref } from 'vue';
import type { CreateOrderPayload, OrderItem, OrderUnit } from '../types/order';

const emit = defineEmits<{
  submit: [payload: CreateOrderPayload];
}>();

const ingredients = [
  'Tomatoes',
  'Potatoes',
  'Onions',
  'Chicken breast',
  'Basmati rice',
  'Olive oil',
  'Fresh basil',
  'Mozzarella',
  'Spinach',
  'Garlic',
] as const;

const units: OrderUnit[] = ['g', 'kg', 'items'];

const item = reactive<OrderItem>({
  name: ingredients[0],
  quantity: 10,
  unit: 'kg',
});

const deliveryDate = ref(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16));
const deliveryAddress = ref('12 Kitchen Lane, London, E1 6AN');

function submitOrder() {
  emit('submit', {
    items: [
      {
        name: item.name,
        quantity: Number(item.quantity),
        unit: item.unit,
      },
    ],
    deliveryDate: new Date(deliveryDate.value).toISOString(),
    deliveryAddress: deliveryAddress.value.trim(),
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
      <select v-model="item.name" required>
        <option v-for="ingredient in ingredients" :key="ingredient" :value="ingredient">
          {{ ingredient }}
        </option>
      </select>
    </label>

    <div class="row">
      <label>
        Quantity
        <input v-model.number="item.quantity" required type="number" min="1" step="1" />
      </label>

      <label>
        Unit
        <select v-model="item.unit" required>
          <option v-for="unit in units" :key="unit" :value="unit">
            {{ unit }}
          </option>
        </select>
      </label>
    </div>

    <label>
      Delivery address
      <input
        v-model="deliveryAddress"
        required
        type="text"
        placeholder="Street, city, postcode"
        autocomplete="street-address"
      />
    </label>

    <label>
      Delivery date
      <input v-model="deliveryDate" required type="datetime-local" />
    </label>

    <button type="submit">Place order</button>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { signIn, signUp } from '../services/cognitoAuth';

const emit = defineEmits<{
  authenticated: [];
}>();

const mode = ref<'signin' | 'signup'>('signin');
const email = ref('demo@kitchen.com');
const password = ref('DemoKitchen1!');
const kitchenId = ref('demo-kitchen');
const loading = ref(false);
const error = ref('');
const success = ref('');

async function submit() {
  loading.value = true;
  error.value = '';
  success.value = '';

  try {
    if (mode.value === 'signup') {
      await signUp(email.value, password.value, kitchenId.value);
      success.value = 'Account created. Check your email if verification is required, then sign in.';
      mode.value = 'signin';
    } else {
      await signIn(email.value, password.value);
      emit('authenticated');
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Authentication failed';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <section class="card auth-card">
    <div>
      <p class="eyebrow">Authentication</p>
      <h2>{{ mode === 'signin' ? 'Sign in' : 'Create account' }}</h2>
      <p class="muted">AWS Cognito secures access to the ordering API.</p>
    </div>

    <div class="mode-toggle">
      <button type="button" :class="{ active: mode === 'signin' }" @click="mode = 'signin'">
        Sign in
      </button>
      <button type="button" :class="{ active: mode === 'signup' }" @click="mode = 'signup'">
        Sign up
      </button>
    </div>

    <form class="auth-form" @submit.prevent="submit">
      <label>
        Email
        <input v-model="email" required type="email" autocomplete="username" placeholder="chef@kitchen.com" />
      </label>

      <label v-if="mode === 'signup'">
        Kitchen ID
        <input v-model="kitchenId" required placeholder="demo-kitchen" />
      </label>

      <label>
        Password
        <input
          v-model="password"
          required
          type="password"
          autocomplete="current-password"
          placeholder="At least 8 characters"
        />
      </label>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Please wait...' : mode === 'signin' ? 'Sign in' : 'Create account' }}
      </button>
    </form>

    <p v-if="error" class="alert error">{{ error }}</p>
    <p v-if="success" class="alert success">{{ success }}</p>
  </section>
</template>

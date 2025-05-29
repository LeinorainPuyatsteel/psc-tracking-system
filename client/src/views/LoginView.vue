<template>
  <div class="container py-5">
    <h3 class="mb-3">Login</h3>
    <form @submit.prevent="login">
      <div class="mb-3">
        <input v-model="username" type="text" class="form-control" placeholder="Username" required />
      </div>
      <div class="mb-3">
        <input v-model="password" type="password" class="form-control" placeholder="Password" required />
      </div>
      <button class="btn btn-primary w-100" type="submit">Login</button>
      <div v-if="error" class="text-danger mt-2">{{ error }}</div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from '@/api'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('')
const password = ref('')
const error = ref('')

async function login() {
  try {
    const res = await axios.post('/auth/login', { username: username.value, password: password.value })
    localStorage.setItem('token', res.data.token)
    router.push('/dashboard')
  } catch (err) {
    error.value = 'Login failed'
  }
}
</script>

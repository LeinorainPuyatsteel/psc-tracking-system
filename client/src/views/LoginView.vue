<template>
  <div class="container d-flex align-items-center justify-content-center">
    <div class="row justify-content-center">
      <h3 class="mb-3 text-center">PSC Login</h3>
    </div>
    <div class="row justify-content-center">
      <div class="col-xl-12">
        <form @submit.prevent="login">
          <div class="mb-3">
            <label class="form-label">Username</label>
            <input v-model="username" type="text" class="form-control" required />
          </div>
          <div class="mb-3">
            <label class="form-label">Password</label>
            <input v-model="password" type="password" class="form-control" required />
          </div>
          <button class="btn btn-primary w-100">Login</button>
        </form>
        <div v-if="error" class="text-danger mt-2">{{ error }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/api'

const username = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()

async function login() {
  console.log('Login triggered')
  try {
    const res = await axios.post('/auth/login', {
      username: username.value,
      password: password.value
    })
    localStorage.setItem('token', res.data.token)
    router.push('/dashboard')
  } catch (err) {
    console.log(err.response?.data || err.message)
    error.value = 'Invalid username or password.'
  }
}
</script>

<template>
  <div class="vh-100 d-flex align-items-center justify-content-center blue-glass-bg">
    <div class="container px-4">
      <div class="row justify-content-center">
        <div class="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">
          <div class="glass-card p-4">
            <h3 class="mb-4 text-center text-white">PSC Login</h3>
            <form @submit.prevent="login">
              <div class="mb-3">
                <label class="form-label text-white">Username</label>
                <input
                  v-model="username"
                  type="text"
                  class="form-control"
                  required
                />
              </div>
              <div class="mb-3">
                <label class="form-label text-white">Password</label>
                <input
                  v-model="password"
                  type="password"
                  class="form-control"
                  required
                />
              </div>
              <button class="btn btn-primary w-100">Login</button>
            </form>
            <div v-if="error" class="text-warning mt-3 text-center small">
              {{ error }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "@/api";
import { useUserStore } from "@/stores/user";

const username = ref("");
const password = ref("");
const error = ref("");
const router = useRouter();
const userStore = useUserStore();

async function login() {
  console.log("Login triggered");
  try {
    const res = await axios.post("/auth/login", {
      username: username.value,
      password: password.value,
    });

    userStore.login(res.data.token);

    await userStore.fetchUser();

    router.push("/dashboard");
  } catch (err) {
    console.log(err.response?.data || err.message);
    error.value = "Invalid username or password.";
  }
}
</script>


<style scoped>
.blue-glass-bg {
  background: linear-gradient(to bottom right, #0f2027, #203a43, #2c5364);
  background-size: cover;
  background-position: center;
}

.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 16px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
</style>

<template>
  <div class="vh-100 d-flex align-items-center justify-content-center blue-glass-bg">
    <div class="container px-4">
      <div class="row justify-content-center">
        <div class="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">
          <div class="glass-card p-4">
            <div class="text-center">
              <font-awesome-icon :icon="['fa', 'user-large',]" size="6x" inverse/>
            </div>
            <br>
            <h3 class="mb-4 text-center">PSC Tracking System</h3>
            <form @submit.prevent="login">
              <div class="mb-3 input-icon-wrapper">
                <font-awesome-icon class="input-icon px-3" :icon="['fa', 'user',]"/>
                <input
                  v-model="username"
                  type="text"
                  class="form-control rounded-pill input-with-icon"
                  placeholder="Username"
                  required
                />
              </div>
              <div class="mb-3 input-icon-wrapper">
                <font-awesome-icon class="input-icon px-3" :icon="['fa', 'lock',]"/>
                <input
                  v-model="password"
                  type="password"
                  class="form-control rounded-pill input-with-icon"
                  placeholder="Password"
                  required
                />
              </div>
              <button class="btn btn-primary w-100 rounded-pill">Login</button>
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
  .container{
    background-color: transparent !important;
  }

  .blue-glass-bg {
    background: radial-gradient(circle,rgba(196, 237, 255, 1) 35%, rgba(42, 123, 155, 1) 95%);
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

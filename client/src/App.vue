<script setup>
  import { onMounted } from 'vue';
  import { useUserStore } from '@/stores/user';

  const userStore = useUserStore();

  onMounted(async () => {
    await userStore.fetchUser();
    userStore.fetchUser()
  });
</script>

<template>
  <router-view />
</template>
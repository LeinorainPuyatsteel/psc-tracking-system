import { defineStore } from 'pinia'
import axios from 'axios'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
  }),
  actions: {
    async fetchUser() {
      if (!this.token) return
      try {
        const res = await axios.get('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        })
        // console.log('Fetched user:', res.data)
        this.user = res.data
      } catch (err) {
        this.logout()
      }
    },
    login(token) {
      this.token = token
      localStorage.setItem('token', token)
    },
    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('token')
    },
  },
})

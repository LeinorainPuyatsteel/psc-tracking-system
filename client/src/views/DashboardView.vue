<template>
  <div class="dashboard-wrapper d-flex justify-content-center align-items-start py-5">
    <div class="container-fluid py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h4 class="mb-0">PSC Tracking System</h4>
        <button @click="handleLogout" class="logout-button">Logout</button>
      </div>
      <!-- <button class="btn btn-success mb-3" @click="loadSO">
        Load SO
      </button> -->

      <div class="so-loader">
        <input
          v-model="soNumber"
          type="text"
          placeholder="Enter SO number"
          class="input"
        />
        <button @click="searchAndAddSO" class="btn">
          Search & Add SO
        </button>
      </div>

      <!-- <h3 class="mb-4 text-center">Pipeline</h3> -->

      <!-- Mobile Tabs -->
      <ul class="nav nav-tabs flex-column d-md-none mb-3" id="orderTabs">
        <li class="nav-item mb-2" v-for="(status, index) in statuses" :key="status">
          <button
            class="nav-link w-100 text-start"
            :class="{ active: index === activeTab }"
            type="button"
            @click="activeTab = index"
          >
            <font-awesome-icon :icon="iconMap[status]" class="me-2" />
            {{ status }}
          </button>
        </li>
      </ul>

      <div class="tab-content d-md-none" id="tabContentMobile">
        <div
          class="tab-pane fade"
          :class="{ 'show active': index === activeTab }"
          v-for="(status, index) in statuses"
          :id="slugify(status)"
          :key="status"
        >
          <div v-for="order in orderMap[status]" :key="order.id" class="card mb-3">
            <div class="card-body" @click="$router.push(`/orders/${order.id}`)">
              <div v-if="statuses.indexOf(order.status) < 3">
                <strong>Sales Order #{{ order.id }}</strong> - {{ order.customer_name }}<br />
                <span class="badge bg-info text-dark mt-1">{{ order.status }}</span>
              </div>
              <div v-else>
                <strong>DRs:</strong>
                <ul>
                  <li v-for="dr in order.deliveryReceipts" :key="dr.id">{{ dr.id }}</li>
                </ul>
              </div>
              <div class="mt-2" v-if="userStore.user?.role !== 'clet'">
                <label class="form-label mb-1 small">Change Status:</label>
                <select
                  class="form-select form-select-sm"
                  :value="order.status"
                  @change="e => updateStatus(order, e.target.value)"
                  @click.stop
                >
                  <option
                    v-for="s in statuses.slice(statuses.indexOf(order.status))"
                    :key="s"
                    :value="s"
                  >
                    {{ s }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Desktop Kanban -->
      <div class="kanban-board d-none d-md-flex gap-4">
        <div
          class="kanban-column flex-grow-1"
          v-for="status in statuses"
          :key="status"
        >
          <h6 class="text-white">
            <font-awesome-icon :icon="iconMap[status]" class="me-2" />
            {{ status }}
          </h6>
          <div v-if="orderMap[status]?.length === 0" class="text-light small mt-2 text-center">
            No Sales Order for this stage.
          </div>
          <draggable
            :list="orderMap[status]"
            :group="'orders'"
            class="sortable-area"
            item-key="id"
            @end="onDragEnd"
            :move="onMoveAttempt"
            :data-status="status"
            :disabled="userStore.user?.role === 'clet'"
          >
            <template #item="{ element: order }">
              <div class="card mb-3 draggable-card">
                <div class="card-body" @click="$router.push(`/orders/${order.id}`)">
                  <strong>Sales Order #{{ order.id }}</strong> - {{ order.customer_name }}
                </div>
              </div>
            </template>
          </draggable>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from "axios";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import { useOrders } from "@/composables/useOrders";
import { createOrder } from "@/services/orderService";
import draggable from "vuedraggable";

const userStore = useUserStore();
const router = useRouter();
const activeTab = ref(0);
const soNumber = ref('');

const {
  statuses,
  orderMap,
  fetchOrders,
  handleStatusChange,
  moveOrderBack,
  iconMap,
  slugify,
  resetOrderMap
} = useOrders();

function onMoveAttempt(evt) {
  return true;
}

onMounted(fetchOrders);

function handleLogout() {
  userStore.logout();
  router.push("/login");
}

async function onDragEnd({ item, to }) {
  const order = item?.__draggable_context?.element;
  const newStatus = to?.dataset?.status;

  if (!order || !newStatus) return;

  try {
    await handleStatusChange(order, newStatus);
  } catch (err) {
    alert(err.message);
    await fetchOrders();
  }
  fetchOrders();
}

async function updateStatus(order, newStatus) {
  console.log('Old:', order.status, 'New:', newStatus);
  try {
    await handleStatusChange(order, newStatus);
  } catch (err) {
    alert(err.message);
    // await fetchOrders();
  }
}

async function searchAndAddSO() {
  if (!soNumber.value) return alert("Please enter a Sales Order number.");

  try {
    const response = await axios.get('api/mock_so.json')
    const mockSOList = response.data
    const mockSO = mockSOList.find(so => so.id === parseInt(soNumber.value))

    if (!mockSO) {
      alert(`Sales Order #${soNumber.value} not found.`)
      return
    }

    await createOrder(mockSO);
    await fetchOrders();
    alert("Sales Order added successfully!");
  } catch (err) {
    if (err.response?.data?.error === "Duplicate entry detected") {
      alert(`❌ Cannot add: Sales Order #${soNumber.value} already exists.`);
    } else {
      console.error("Create failed:", err);
      alert("Something went wrong while adding the order.");
    }
  }
}
</script>

<style scoped>

body {
  background: linear-gradient(135deg, #1e3c72, #2a5298);
  min-height: 100vh;
  margin: 0;
  font-family: 'Segoe UI', sans-serif;
  color: white;
}

.glass-card {
  background: rgba(255, 255, 255, 0.85); /* Light glass background */
  backdrop-filter: blur(8px);
  border: none;
  border-radius: 1rem;
  box-shadow: 0 0 15px rgba(0, 123, 255, 0.2);
}

.text-dark {
  color: #212529 !important;
}

.dashboard-wrapper {
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3c72, #2a5298);
}

.container-fluid {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.25);
  color: white;
  max-width: 1400px;
  width: 100%;
}

.card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 1rem;
  color: white;
}

.card-body {
  cursor: pointer;
}

.logout-button {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  padding: 0.4rem 1rem;
  border-radius: 0.5rem;
  color: white;
  transition: background 0.3s;
}

.logout-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.kanban-board {
  overflow-x: auto;
  padding-bottom: 1rem;
}

.sortable-area {
  min-height: 150px;
}

.kanban-column h6 {
  background: linear-gradient(135deg, #1e3c72, #2a5298);
  /* border-radius: 1rem; */
}

.kanban-column {
  background: linear-gradient(135deg, #1e3c72, #2a5298);
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.438);
  border-radius: 1rem;
}

/* SEARCH BUTTON */
.so-loader {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.input {
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
}
.btn {
  padding: 0.5rem 1rem;
  background-color: #0066cc;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

</style>
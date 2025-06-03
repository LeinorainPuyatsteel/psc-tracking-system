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
              <div>
                <strong>Sales Order #{{ order.id }}</strong> - {{ order.customer_name }}<br />
                <span class="badge bg-info text-dark mt-1">{{ order.status }}</span>
              </div>
              <div class="mt-2" v-if="userStore.user?.role !== 'clet'">
                <label class="form-label mb-1 small">Change Status:</label>
                <select
                  class="form-select form-select-sm"
                  v-model="order.status"
                  @change="updateStatus(order, order.status)"
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
import { onMounted, reactive, ref } from "vue";
import draggable from "vuedraggable";
import axios from "@/api";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();
const router = useRouter();
const activeTab = ref(0);
const soNumber = ref('')

const statuses = [
  "Sales Order is Being Prepared",
  "Sales Order has been Fully Prepared and Transferred to the Loading Area",
  "Loading is Ongoing",
  "Fully Loaded",
  "Waiting to be Dispatched",
  "Truck is Being Weighed",
  "Ready for Dispatch with no Discrepancy",
  "Truck is Dispatched",
];

const iconMap = {
  "Sales Order is Being Prepared": "clipboard-list",
  "Sales Order has been Fully Prepared and Transferred to the Loading Area": "dolly",
  "Loading is Ongoing": "truck-loading",
  "Fully Loaded": "truck-front",
  "Waiting to be Dispatched": "clock",
  "Truck is Being Weighed": "weight",
  "Ready for Dispatch with no Discrepancy": "clipboard-check",
  "Truck is Dispatched": "truck-fast",
};

const slugify = (text) =>
  text.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");

const orderMap = reactive({});

function resetOrderMap() {
  statuses.forEach((status) => {
    orderMap[status] = [];
  });
}

async function fetchOrders() {
  const res = await axios.get("/orders");
  resetOrderMap();
  res.data.forEach((order) => {
    if (!orderMap[order.status]) orderMap[order.status] = [];
    orderMap[order.status].push(order);
  });
}

async function onDragEnd(event) {
  const moved = event.item.__draggable_context?.element;
  const newStatus = event.to?.dataset?.status;
  if (!moved || !newStatus) return;

  const oldIndex = statuses.indexOf(moved.status);
  const newIndex = statuses.indexOf(newStatus);

  if (newIndex < oldIndex) {
    alert("Cannot move to an earlier stage.");
    await fetchOrders();
    return;
  }

  moved.status = newStatus;
  const statusIndex = statuses.indexOf(newStatus) + 1;
  await axios.put(`/orders/${moved.id}`, { status_id: statusIndex });
}

async function updateStatus(order, newStatus) {
  const oldStatus = Object.keys(orderMap).find((key) => orderMap[key].includes(order));
  const oldIndex = statuses.indexOf(oldStatus);
  const newIndex = statuses.indexOf(newStatus);

  if (newIndex < oldIndex) {
    alert("You cannot move the order to an earlier stage.");
    order.status = oldStatus;
    return;
  }

  const file = await promptForImage();
  if (!file) {
    alert("Image upload canceled. Status not updated.");
    order.status = oldStatus;
    return;
  }

  const formData = new FormData();
  formData.append("status_id", newIndex + 1);
  formData.append("image", file);

  try {
    await axios.put(`/orders/${order.id}/update-status`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    orderMap[oldStatus] = orderMap[oldStatus].filter(o => o.id !== order.id);
    orderMap[newStatus].push(order);

  } catch (err) {
    console.error("Error updating status:", err);
    alert("Failed to update status.");
    order.status = oldStatus;
  }

  // if (oldStatus && oldStatus !== newStatus) {
  //   orderMap[oldStatus] = orderMap[oldStatus].filter((o) => o.id !== order.id);
  //   if (!orderMap[newStatus]) orderMap[newStatus] = [];
  //   orderMap[newStatus].push(order);
  //   const statusIndex = statuses.indexOf(newStatus) + 1;
  //   await axios.put(`/orders/${order.id}`, { status_id: statusIndex });
  // }
}

function handleLogout() {
  userStore.logout();
  router.push("/login");
}

const searchAndAddSO = async () => {
  if (!soNumber.value) {
    alert('Please enter a Sales Order number.')
    return
  }

  try {
    const response = await axios.get('/mock_so.json')
    const mockSOList = response.data

    const mockSO = mockSOList.find(so => so.id === parseInt(soNumber.value))

    if (!mockSO) {
      alert(`Sales Order #${soNumber.value} not found.`)
      return
    }

    const saveRes = await axios.post('/orders', mockSO);
    await fetchOrders();

    console.log('✅ Sales Order added:', saveRes.data)
    alert('Sales Order added successfully!')
  } catch (err) {
    if (err.response && err.response.status === 400 && err.response.data?.error === 'Duplicate entry detected') {
      alert(`❌ Cannot add: Sales Order #${soNumber.value} already exists.`);
    } else {
      console.error('❌ Order create failed:', err);
      alert('Something went wrong while adding the order.');
    }
  }
}

async function promptForImage() {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => resolve(input.files[0]);
    input.click();
  });
}

onMounted(fetchOrders);

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
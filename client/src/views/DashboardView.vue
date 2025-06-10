<template>
  <div class="dashboard-wrapper d-flex justify-content-center align-items-start py-5">
    <div class="container-fluid py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h4 class="mb-0">PSC Tracking System</h4>
        <button
          @click="handleLogout"
          class="btn btn-danger rounded-pill px-md-5 ms-auto"
        >
          <font-awesome-icon :icon="['fa', 'right-from-bracket']" />
          Logout
        </button>
      </div>

      <div class="so-loader d-flex align-items-center px-md-4">
        <div class="d-flex align-items-center">
          <div class="input-icon-wrapper">
            <font-awesome-icon class="input-icon px-3" :icon="['fa', 'magnifying-glass']" />
            <input
              v-model="soNumber"
              type="text"
              placeholder="Sales Order Number"
              class="form-control rounded-start-pill input-with-icon"
            />
          </div>
          <button
            @click="searchAndAddSO"
            class="btn btn-primary rounded-end-pill w-50"
          >
            <font-awesome-icon :icon="['fa', 'plus']" />
            Add SO
          </button>
        </div>
      </div>

      <br>
      <!-- <h3 class="mb-4 text-center">Pipeline</h3> -->

      <!-- Mobile Tabs -->
      <ul
        class="nav nav-tabs flex-row d-md-none mb-3 overflow-auto hide-scrollbar status-swipe"
        id="orderTabs"
      >
        <li
          class="nav-item me-2"
          v-for="(status, index) in statuses"
          :key="status"
          style="flex: 0 0 auto;"
        >
          <button
            class="nav-link"
            :class="{ active: index === activeTab }"
            type="button"
            @click="setActiveTab(index)"
            :ref="el => registerTabRef(el, index)"
          >
            <font-awesome-icon :icon="iconMap[status]" class="me-1" />
            {{ status }}
          </button>
        </li>
      </ul>
      <div
        class="tab-content d-md-none swipe-area"
        id="tabContentMobile"
        @touchstart="handleTouchStart"
        @touchend="handleTouchEnd"
      >
        <div class="position-relative" style="min-height: 150px;">
          <transition :name="`slide-${transitionDirection}`" mode="out-in">
            <div
              class="tab-pane fade show active"
              v-if="statuses[activeTab]"
              :id="slugify(statuses[activeTab])"
              :key="statuses[activeTab]"
            >
              <template v-if="orderMap[statuses[activeTab]]?.length">
                <div
                  v-for="entry in orderMap[statuses[activeTab]]"
                  :key="`${entry.isDR ? 'dr' : 'so'}-${entry.id}`"
                  class="card mb-3 shadow"
                >
                    <div class="card-body">
                      <div v-if="entry.isDR">
                        <h5 class="card-title">Delivery Receipt #{{ entry.id }}</h5>
                      <p class="card-text">
                        <strong>Customer:</strong> {{ entry.customer_name }}<br />
                        <strong>SO #:</strong> {{ entry.sales_order_id }}<br />
                        <strong>Status:</strong> {{ entry.status || 'N/A' }}
                      </p>
                    </div>
                    <div v-else>
                      <h5 class="card-title">Sales Order #{{ entry.id }}</h5>
                      <p class="card-text">
                        <strong>Customer:</strong> {{ entry.customer_name }}<br />
                        <strong>Status:</strong> {{ entry.status }}
                      </p>
                    </div>
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="text-center py-4">
                  {{ activeTab === 0 ? 'No Sales Order' : 'No Delivery Receipt' }}
                </div>
              </template>
            </div>
          </transition>
        </div>
      </div>

      <!-- Desktop Kanban -->
      <div class="kanban-board d-none d-md-flex gap-4">
        <div
          class="kanban-column flex-grow-1"
          v-for="status in statuses"
          :key="status"
        >
          <h6>
            <font-awesome-icon :icon="iconMap[status]" class="me-2" />
            {{ status }}
          </h6>

          <div
            v-if="orderMap[status]?.length === 0"
            class="text-light small mt-2 text-center"
          >
            No Orders for this stage.
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
                <div
                  class="card-body"
                  @click="
                    $router.push(
                      order.isDR
                        ? `/orders/${order.sales_order_id}`
                        : `/orders/${order.id}`
                    )
                  "
                >
                  <strong v-if="order.isDR">
                    Delivery Receipt #{{ order.id }}
                  </strong>
                  <strong v-else>
                    Sales Order #{{ order.id }}
                  </strong>
                  <div>
                    {{ order.customer_name }}
                    <span v-if="order.isDR" class="d-block text-muted small">
                      From SO #{{ order.sales_order_id }}
                    </span>
                  </div>
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
import { ref, onMounted, nextTick } from "vue";
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

let touchStartX = 0
let touchEndX = 0
const transitionDirection = ref("left");

const tabRefs = ref([]);

function handleTouchStart(e) {
  touchStartX = e.changedTouches[0].screenX;
}

function handleTouchEnd(e) {
  touchEndX = e.changedTouches[0].screenX;
  const delta = touchEndX - touchStartX;

  if (delta < -50 && activeTab.value < statuses.length - 1) {
    setActiveTab(activeTab.value + 1);
  } else if (delta > 50 && activeTab.value > 0) {
    setActiveTab(activeTab.value - 1);
  }
}

function onMoveAttempt(evt) {
  return true;
}

function registerTabRef(el, index) {
  if (el) {
    tabRefs.value[index] = el;
  }
}

function setActiveTab(index) {
  if (index === activeTab.value) return;
  transitionDirection.value = index > activeTab.value ? 'left' : 'right';
  activeTab.value = index;

  nextTick(() => {
    if (tabRefs.value[index]) {
      tabRefs.value[index].scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    } else {
      console.warn('Tab ref not found for index:', index);
    }
  });
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
.glass-card {
  background: rgba(255, 255, 255, 0.85); /* Light glass background */
  backdrop-filter: blur(8px);
  border: none;
  border-radius: 1rem;
  box-shadow: 0 0 15px rgba(0, 123, 255, 0.2);
}

.dashboard-wrapper {
  min-height: 100vh;
}

.container-fluid {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.25);
  max-width: 1400px;
  width: 100%;
}

.card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 1rem;
}

.card-body {
  cursor: pointer;
}

.kanban-board {
  overflow-x: auto;
  padding-bottom: 1rem;
}

.sortable-area {
  min-height: 150px;
}

.kanban-column {
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.438);
  border-radius: 1rem;
}

</style>
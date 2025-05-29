<template>
  <div class="container-fluid py-4">
    <h4 class="mb-4">PSC Tracking System</h4>

    <!-- Mobile Tabs -->
    <ul class="nav nav-tabs d-md-none mb-3" id="orderTabs">
      <li class="nav-item" v-for="(status, index) in statuses" :key="status">
        <button
          class="nav-link"
          :class="{ active: index === activeTab }"
          type="button"
          @click="activeTab = index"
        >
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
        <div v-if="orderMap[status]?.length">
          <div
            v-for="order in orderMap[status]"
            :key="order.id"
            class="card mb-2"
          >
            <div class="card-body">
              Sales Order #{{ order.id }} - {{ order.customer }}<br />
              <span class="badge bg-secondary">{{ order.status }}</span>
            </div>
          </div>
        </div>
        <div v-else class="text-muted text-center py-2">
          No orders in this status
        </div>
      </div>
    </div>

    <!-- Desktop Kanban -->
    <div class="kanban-board d-none d-md-flex gap-3">
      <div class="kanban-column flex-grow-1" v-for="status in statuses" :key="status">
        <h6>{{ status }}</h6>
        <draggable
          :list="orderMap[status]"
          :group="'orders'"
          class="sortable-area"
          item-key="id"
          @end="onDragEnd"
          :data-status="status"
        >
          <template #item="{ element }">
            <div class="card mb-2 draggable-card">
              <div class="card-body">
                Sales Order #{{ element.id }} - {{ element.customer }}
              </div>
            </div>
          </template>
        </draggable>
        <div v-if="orderMap[status]?.length === 0" class="text-muted small mt-2">
          No orders
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import draggable from 'vuedraggable'
import axios from '@/api'

const activeTab = ref(0)

const statuses = [
  'Sales Order Being Prepared',
  'Fully Prepared, Transferred to Loading Area',
  'Loading is Ongoing',
  'Fully Loaded and Ready for Dispatch',
  'Fully Loaded and Waiting for Dispatch',
  'Truck is Being Weighed',
  'Ready for Dispatch with no Discrepancy',
]

const slugify = (text) =>
  text.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')

const orderMap = reactive({})

// Initialize empty arrays for each status
function resetOrderMap() {
  statuses.forEach((status) => {
    orderMap[status] = []
  })
}

async function fetchOrders() {
  const res = await axios.get('/orders')
  resetOrderMap()

  res.data.forEach((order) => {
    if (!orderMap[order.status]) {
      orderMap[order.status] = []
    }
    orderMap[order.status].push(order)
  })
}

async function onDragEnd(event) {
  const moved = event.item.__draggable_context?.element
  const newStatus = event.to?.dataset?.status
  if (!moved || !newStatus) return

  moved.status = newStatus
  const statusIndex = statuses.indexOf(newStatus) + 1

  console.log('Updating order:', moved.id, 'to status_id:', statusIndex)
  await axios.put(`/orders/${moved.id}`, { status_id: statusIndex })
}

onMounted(fetchOrders)
</script>

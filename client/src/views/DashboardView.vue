<template>
  <div class="container-fluid py-4">
    <h4 class="mb-4">PSC Tracking System</h4>

    <!-- Mobile Tabs -->
    <ul class="nav nav-tabs d-md-none mb-3" id="orderTabs">
      <li class="nav-item" v-for="(status, index) in statuses" :key="status">
        <button class="nav-link" :class="{ active: index === 0 }"
          data-bs-toggle="tab"
          :data-bs-target="'#' + slugify(status)"
          type="button"
        >
          {{ status }}
        </button>
      </li>
    </ul>

    <div class="tab-content d-md-none" id="tabContentMobile">
      <div
        class="tab-pane fade"
        :class="{ 'show active': index === 0 }"
        v-for="(status, index) in statuses"
        :id="slugify(status)"
        :key="status"
      >
        <div v-for="order in filteredOrders(status)" :key="order.id" class="card mb-2">
          <div class="card-body">
            Sales Order #{{ order.id }} - {{ order.customer }}<br />
            <span class="badge bg-secondary">{{ order.status }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Desktop Kanban -->
    <div class="kanban-board d-none d-md-flex">
      <div class="kanban-column" v-for="status in statuses" :key="status">
        <h6>{{ status }}</h6>
        <draggable
          :list="filteredOrders(status)"
          :group="'orders'"
          class="sortable-area"
          item-key="id"
          @end="onDragEnd($event, status)"
        >
          <template #item="{ element }">
            <div class="card mb-2 draggable-card">
              <div class="card-body">
                Sales Order #{{ element.id }} - {{ element.customer }}
              </div>
            </div>
          </template>
        </draggable>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import draggable from 'vuedraggable'
import axios from '@/api'

const orders = ref([])
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
  text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')

function filteredOrders(status) {
  return orders.value.filter((order) => order.status === status)
}

async function fetchOrders() {
  const res = await axios.get('/orders')
  orders.value = res.data
}

async function onDragEnd(event, newStatus) {
  const moved = event.item.__draggable_context.element
  moved.status = newStatus
  await axios.put(`/orders/${moved.id}`, { status: newStatus })
}

onMounted(fetchOrders)
</script>

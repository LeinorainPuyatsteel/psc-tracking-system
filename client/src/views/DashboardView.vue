<template>
  <div class="container-fluid py-4">
    <h4 class="mb-4">PSC Tracking System</h4>

    <!-- Tabs on Mobile -->
    <ul class="nav nav-tabs d-md-none mb-3" id="orderTabs">
      <li v-for="(status, index) in statuses" :key="status" class="nav-item">
        <button class="nav-link" :class="{ active: index === 0 }" data-bs-toggle="tab" :data-bs-target="'#' + slugify(status)">
          {{ status }}
        </button>
      </li>
    </ul>

    <div class="tab-content d-md-none">
      <div v-for="(status, index) in statuses" :key="status" :id="slugify(status)"
           class="tab-pane fade" :class="{ 'show active': index === 0 }">
        <div v-for="order in filteredOrders(status)" :key="order.id" class="card mb-2">
          <div class="card-body">
            Sales Order #{{ order.id }} - {{ order.customer }}
            <br>
            <span class="badge bg-secondary">{{ order.status }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Kanban on Desktop -->
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
              <div class="card-body">Sales Order #{{ element.id }} - {{ element.customer }}</div>
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
  'Ready for Dispatch with no Discrepancy'
]

function slugify(text) {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '')
}

function filteredOrders(status) {
  return orders.value.filter(o => o.status === status)
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

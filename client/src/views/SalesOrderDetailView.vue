<template>
  <div class="container py-4">
    <button class="btn btn-secondary mb-3" @click="$router.back()">
      <font-awesome-icon icon="arrow-left" class="me-2" /> Back
    </button>

    <h4 class="mb-3">Sales Order #{{ order.id }}</h4>
    <p><strong>Customer:</strong> {{ order.customer_name }}</p>
    <p><strong>Address:</strong> {{ order.customer_address }}</p>
    <p><strong>Contact:</strong> {{ order.customer_contact_number }}</p>
    <p><strong>Status:</strong> {{ order.status?.status }}</p>

    <hr />

    <h5>Items</h5>
    <ul class="list-group mb-4">
      <li class="list-group-item" v-for="item in order.Items" :key="item.id">
        {{ item.product_name }} — {{ item.quantity }} pcs ({{ item.thickness }}mm x {{ item.width }}mm x {{ item.length }}mm)
      </li>
    </ul>

    <h5>Delivery Receipts</h5>
    <ul class="list-group mb-4">
      <li
        class="list-group-item d-flex justify-content-between align-items-center"
        v-for="dr in order.DeliveryReceipts"
        :key="dr.id"
        @click="openDeliveryModal(dr)"
        role="button"
      >
        DR #{{ dr.id }} <span class="badge bg-info">{{ dr.status?.status }}</span>
      </li>
    </ul>

    <h5>Transaction Logs</h5>
    <ul class="list-group">
      <li class="list-group-item" v-for="tx in order.Transactions" :key="tx.id">
        {{ tx.status?.status }} — {{ new Date(tx.createdAt).toLocaleString() }}
      </li>
    </ul>

    <!-- Delivery Receipt Modal -->
    <div
      class="modal fade"
      id="deliveryModal"
      tabindex="-1"
      aria-labelledby="deliveryModalLabel"
      aria-hidden="true"
      ref="modalRef"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Delivery Receipt #{{ selectedDr?.id }}</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <p><strong>Status:</strong> {{ selectedDr?.status?.status }}</p>
            <h6>Items</h6>
            <ul class="list-group mb-3">
              <li
                class="list-group-item"
                v-for="item in selectedDr?.Items || []"
                :key="item.id"
              >
                {{ item.product_name }} — {{ item.quantity }} pcs ({{ item.thickness }}mm x {{ item.width }}mm x {{ item.length }}mm)
              </li>
            </ul>

            <h6>Transactions</h6>
            <ul class="list-group">
              <li
                class="list-group-item"
                v-for="tx in selectedDr?.Transactions || []"
                :key="tx.id"
              >
                {{ tx.status?.status }} — {{ new Date(tx.createdAt).toLocaleString() }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import axios from '@/api';
import { Modal } from 'bootstrap';

const route = useRoute();
const order = ref({});
const selectedDr = ref(null);
const modalRef = ref();
let modalInstance = null;

onMounted(async () => {
  const res = await axios.get(`/orders/${route.params.id}`);
  order.value = res.data;
});

function openDeliveryModal(dr) {
  selectedDr.value = dr;
  modalInstance = new Modal(modalRef.value);
  modalInstance.show();
}
</script>

<style scoped>
.list-group-item {
  cursor: pointer;
}
</style>

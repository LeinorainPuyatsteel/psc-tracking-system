<template>
  <div class="container py-4">
    <button class="btn btn-secondary mb-3" @click="$router.back()">
      <font-awesome-icon icon="arrow-left" class="me-2" /> Back
    </button>

    <h4 class="mb-3">Sales Order #{{ order.id }}</h4>
    <p><strong>Customer:</strong> {{ order.customer_name }}</p>
    <p v-if="userStore.user?.role !== 'girlie'">
      <strong>Address:</strong> {{ order.customer_address }}
    </p>
    <p v-if="userStore.user?.role !== 'girlie'">
      <strong>Contact:</strong> {{ order.customer_contact_number }}
    </p>
    <p>
      <strong>Status:</strong> {{ order.status?.status }}
    </p>
    <a
      v-if="userStore.user?.role !== 'girlie' && order.customer_contact_number"
      :href="`sms:${order.customer_contact_number}?body=${encodeURIComponent(smsMessage)}`"
      class="btn btn-primary mb-3"
    >
      Notify Customer via SMS
    </a>

    <hr />

    <h5 v-if="userStore.user?.role !== 'clet'">Items</h5>
    <ul class="list-group mb-4" v-if="userStore.user?.role !== 'clet'">
      <li class="list-group-item" v-for="item in order.Items" :key="item.id">
        {{ item.product_name }} — {{ item.quantity }} pcs
        ({{ item.thickness }}mm x {{ item.width }}mm x {{ item.length }}mm)
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
        DR #{{ dr.id }}
        <span class="badge bg-info">{{ dr.status?.status }}</span>
      </li>
    </ul>

    <h5>Transaction Logs</h5>
    <ul class="list-group">
      <li
        class="list-group-item"
        v-for="tx in order.Transactions"
        :key="tx.id"
        @click="openTransactionModal(tx)"
        role="button"
      >
        {{ tx.status?.status }} — {{ new Date(tx.createdAt).toLocaleString() }}
        <span v-if="tx.image_url" class="ms-2 badge bg-light text-dark">📷</span>
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
            >
            </button>
          </div>
          <div class="modal-body">
            <p><strong>Status:</strong> {{ selectedDr?.status?.status }}</p>

            <h6 v-if="userStore.user?.role !== 'clet'">Items</h6>
            <ul class="list-group mb-3" v-if="userStore.user?.role !== 'clet'">
              <li
                class="list-group-item"
                v-for="item in selectedDr?.Items || []"
                :key="item.id"
              >
                {{ item.product_name }} — {{ item.quantity }} pcs
                ({{ item.thickness }}mm x {{ item.width }}mm x {{ item.length }}mm)
              </li>
            </ul>

            <!-- Optionally show DR transactions here -->
            
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
    <div
      class="modal fade"
      id="transactionModal"
      tabindex="-1"
      aria-labelledby="transactionModalLabel"
      aria-hidden="true"
      ref="transactionModalRef"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              Transaction Image — {{ selectedTransaction?.status?.status }}
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body text-center">
            <img
              v-if="selectedTransaction?.image_url"
              :src="`http://192.168.0.210:5000${selectedTransaction.image_url}`"
              alt="Transaction Image"
              class="img-fluid rounded shadow"
            />
            <p v-else>No image attached to this transaction.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import axios from "@/api";
import { Modal } from "bootstrap";
import { useUserStore } from "@/stores/user";

const selectedTransaction = ref(null);
const transactionModalRef = ref();
let transactionModalInstance = null;

const route = useRoute();
const userStore = useUserStore();
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

  if (!modalInstance) {
    modalInstance = new Modal(modalRef.value);
  }

  modalInstance.show();
}

const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
});

const statusTimestamp = computed(() => {
  const currentStatusId = order.value.current_status_id;
  const lastTx = order.value.Transactions?.findLast(
    (tx) => tx.status_id === currentStatusId
  );
  return lastTx ? new Date(lastTx.createdAt).toLocaleString() : "";
});

const smsMessage = computed(() => {
  if (!order.value.id || !order.value.status) return "";
  return `${greeting.value} ${order.value.customer_name}, your Sales Order #${order.value.id} is currently: "${order.value.status.status}". This status was updated on ${statusTimestamp.value}. Thank you.`;
});

function openTransactionModal(tx) {
  if (!tx.image_url) return; // Optional: skip if there's no image

  selectedTransaction.value = tx;

  if (!transactionModalInstance) {
    transactionModalInstance = new Modal(transactionModalRef.value);
  }

  transactionModalInstance.show();
}

console.log("User role:", userStore.user?.role);
</script>

<style>
body {
  background: linear-gradient(135deg, #1e3c72, #2a5298);
  min-height: 100vh;
  margin: 0;
  font-family: 'Segoe UI', sans-serif;
  color: white;
}
</style>


<style scoped>
.container {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
  padding: 2rem;
  color: white;
  max-width: 1000px;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.3);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
}

.btn-primary {
  background: rgba(0, 123, 255, 0.3);
  border: none;
  color: white;
}

.btn-primary:hover {
  background: rgba(0, 123, 255, 0.5);
}

.list-group-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
}

.modal-content {
  background: rgba(30, 60, 114, 0.9);
  color: white;
  border-radius: 1rem;
  border: none;
}

.modal-header,
.modal-body {
  border-bottom: none;
}

.modal-title {
  color: white;
}

hr {
  border-color: rgba(255, 255, 255, 0.2);
}
</style>


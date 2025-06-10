import axios from "@/api";

export async function fetchAllOrders() {
  const res = await axios.get("/orders?includeDRs=true");
  return res.data;
}

export async function fetchDeliveryReceipts(orderId) {
  return axios.post(`/orders/${orderId}/fetch-delivery-receipts`);
}

export async function updateOrderStatus(orderId, statusId, imageFile, isDR = false) {
  const formData = new FormData();
  formData.append("status_id", statusId);
  formData.append("image", imageFile)
  
  const endpoint = isDR
    ? `/delivery-receipts/${orderId}/update-status`
    : `/orders/${orderId}/update-status`;

  return axios.put(endpoint, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function createOrder(order) {
  return axios.post("/orders", order);
}

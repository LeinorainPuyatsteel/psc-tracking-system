import axios from "@/api";

export async function fetchAllOrders() {
  const res = await axios.get("/orders");
  return res.data;
}

export async function fetchDeliveryReceipts(orderId) {
  return axios.post(`/orders/${orderId}/fetch-delivery-receipts`);
}

export async function updateOrderStatus(orderId, statusId, imageFile) {
  const formData = new FormData();
  formData.append("status_id", statusId);
  formData.append("image", imageFile);

  return axios.put(`/orders/${orderId}/update-status`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function createOrder(order) {
  return axios.post("/orders", order);
}

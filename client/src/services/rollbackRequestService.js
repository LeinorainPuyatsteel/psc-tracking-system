import axios from "@/api";

export async function submitRollbackRequest({ delivery_receipt_id, from_status, to_status, note }) {
  return axios.post("/rollback-request", {
    delivery_receipt_id,
    from_status,
    to_status,
    note,
  });
}

export async function fetchRollbackRequests(orderId = null) {
  const url = orderId 
    ? `/rollback-requests?order_id=${orderId}` 
    : `/rollback-requests`;
  const res = await axios.get(url);
  return res.data;
}

export async function approveRollbackRequest(id) {
  return axios.post(`/rollback-request/${id}/approve`);
}

export async function rejectRollbackRequest(id) {
  return axios.post(`/rollback-request/${id}/reject`);
}
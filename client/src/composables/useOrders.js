import { ref, reactive } from "vue";
import { fetchAllOrders, createOrder, updateOrderStatus, fetchDeliveryReceipts } from "@/services/orderService";
import { promptForImage } from "@/services/imageService";

const statuses = [ 
  "Sales Order is Being Prepared",
  "Sales Order has been Fully Prepared and Transferred to the Loading Area",
  "Loading is Ongoing",
  "Fully Loaded",
  "Waiting to be Dispatched",
  "Truck is Being Weighed",
  "Ready for Dispatch with no Discrepancy",
  "Truck is Dispatched"
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


export function useOrders() {
  const orderMap = reactive({});
  
  const resetOrderMap = () => {
    statuses.forEach((status) => orderMap[status] = []);
  };

  const fetchOrders = async () => {
    const orders = await fetchAllOrders();
    resetOrderMap();
    orders.forEach((order) => {
      if (!orderMap[order.status]) orderMap[order.status] = [];
      orderMap[order.status].push(order);
    });
  };

  const handleStatusChange = async (order, newStatus) => {
    const oldStatus = order.status;
    const oldIndex = statuses.indexOf(oldStatus);
    const newIndex = statuses.indexOf(newStatus);

    if (newIndex === oldIndex) return;
    if (newIndex < oldIndex) throw new Error("Cannot move to an earlier stage.");

    if (oldIndex === 1 && newIndex === 2) {
      await fetchDeliveryReceipts(order.id);
    }

    const file = await promptForImage();
    if (!file){
      console.log("File status:", !file)
      throw new Error("Image upload canceled.");
    }

    await updateOrderStatus(order.id, newIndex + 1, file);

    orderMap[oldStatus] = orderMap[oldStatus].filter(o => o.id !== order.id);
    orderMap[newStatus].push(order);
    order.status = newStatus;
  };

  return {
    statuses,
    orderMap,
    fetchOrders,
    handleStatusChange,
    iconMap,
    slugify,
    resetOrderMap
  };
}

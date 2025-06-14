import { ref, reactive } from "vue";
import { fetchAllOrders, createOrder, updateOrderStatus, fetchDeliveryReceipts } from "@/services/orderService";
import { promptForImage } from "@/services/imageService";
import { submitRollbackRequest, fetchRollbackRequests } from "@/services/rollbackRequestService";

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
    console.log("Fetched orders:", orders);

    resetOrderMap();

    orders.forEach((order) => {
      const statusIndex = statuses.indexOf(order.status);
      console.log(`Order #${order.id} is at stage ${statusIndex} (${order.status})`);
    
      if (statusIndex >= 1) {
        // Use DRs instead of the SO
        order.DeliveryReceipts.forEach(dr => {
        const statusStr = dr.status?.status || "Unknown";
          if (!orderMap[statusStr]) orderMap[statusStr] = [];
          orderMap[statusStr].push({
            ...dr,
            sales_order_id: order.id,
            customer_name: order.customer_name,
            isDR: true,
            status: statusStr,
          });
        });
      } else {
        if (!orderMap[order.status]) orderMap[order.status] = [];
        orderMap[order.status].push(order);
      }
    }
  );
};

  const rollbackRequests = ref([]);
  
  const loadRollbackRequests = async (orderId = null) => {
    try {
      rollbackRequests.value = await fetchRollbackRequests(orderId);
    } catch (err) {
      console.error("Failed to fetch rollback requests:", err);
      rollbackRequests.value = res.data;
    }
  };

  const handleStatusChange = async (order, newStatus) => {
    const isDR = !!order.isDR;
    console.log(isDR)
    const entityId = order.id;
    const oldStatus = order.status?.status || order.status;
    const oldIndex = statuses.indexOf(oldStatus);
    const newIndex = statuses.indexOf(newStatus);

    if (newIndex === oldIndex) return;
    if (newIndex < oldIndex) {
      const note = prompt(`Enter reason for reverting from ${oldStatus} to ${newStatus}:`);
      if (!note) return alert('Rollback requires a reason.');

      try {
        await submitRollbackRequest({
          delivery_receipt_id: order.id,
          from_status: oldIndex + 1,
          to_status: newIndex + 1,
          note,
        });
        alert('Rollback request sent for approval.');
      } catch (err) {
        alert('Failed to submit rollback request.');
        console.error(err);
      }
      return;
    };

    if (!order.isDR && oldIndex === 0 && newIndex === 1) {
      await fetchDeliveryReceipts(order.id);
    }

    const file = await promptForImage();

    if (!file){
      console.log("File status:", !file)
      throw new Error("Image upload canceled.");
    }

    console.log(
      `[TRACKING] Updating ${isDR ? 'DR' : 'SO'} #${entityId} to stage ${newIndex + 1}`
    );

    await updateOrderStatus(entityId, newIndex + 1, file, isDR);

    if (!orderMap[oldStatus]) {
      console.warn(`⚠️ oldStatus "${oldStatus}" does not exist in orderMap`);
      return;
    }
    
    orderMap[oldStatus] = orderMap[oldStatus].filter(o => o.id !== order.id);
    orderMap[newStatus].push(order);
    order.status = { status: newStatus };
  };

  return {
    statuses,
    orderMap,
    fetchOrders,
    handleStatusChange,
    iconMap,
    slugify,
    resetOrderMap,
    rollbackRequests,
    loadRollbackRequests
  };
}

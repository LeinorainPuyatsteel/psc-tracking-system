const axios = require('axios');
const { DeliveryReceipt, Item } = require('../models');

const DeliveryService = {
  async fetchAndAttachReceipts(order) {
    const res = await axios.get(
      `http://192.168.0.210/psc-delivery-management/index.php/api/get_dr_using_so/${order.id}`
    );

    const data = res.data;
    const grouped = {};

    for (const item of data) {
      if (!grouped[item.dr_no]) {
        grouped[item.dr_no] = {
          dr_no: item.dr_no,
          trucking: item.trucking,
          plate_no: item.plate_no,
          truck_type: item.truck_type,
          items: [],
        };
      }

      grouped[item.dr_no].items.push({
        product_name: item.item_name,
        quantity: parseFloat(item.qty),
        thickness: parseFloat(item.thickness),
        width: parseInt(item.width),
        length: parseInt(item.length),
        linear_meter: parseFloat(item.lm),
        metric_tons: parseFloat(item.mt),
      });
    }

    for (const dr_no in grouped) {
      const group = grouped[dr_no];

      const dr = await DeliveryReceipt.create({
        id: parseInt(dr_no),
        sales_order_id: order.id,
        trucking_name: group.trucking,
        plate_number: group.plate_no,
        truck_type: group.truck_type,
        current_status_id: 1,
      });

      for (const item of group.items) {
        await Item.create({
          ...item,
          sales_order_id: order.id,
          delivery_receipt_id: dr.id,
        });
      }
    }

    console.log(`✅ DRs saved for SO ${order.id}`);
  }
};

module.exports = DeliveryService;
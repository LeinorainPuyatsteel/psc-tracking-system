const { sql, config } = require('../config/mssql');
const { DeliveryReceipt, Item } = require('../models');

const DeliveryService = {
  async fetchAndAttachReceipts(order) {
    await sql.connect(config);

    const result = await sql.query(`
      SELECT 
        DRNo AS dr_no,
        Dscription AS product_name,
        Quantity AS quantity,
        U_Length_FT AS length,
        U_LM AS linear_meter
      FROM VW_DR
      WHERE SONo = '${order.id}'
    `);

    const rows = result.recordset;

    const grouped = {};
    for (const row of rows) {
      if (!grouped[row.dr_no]) {
        grouped[row.dr_no] = {
          dr_no: row.dr_no,
          items: [],
        };
      }

      grouped[row.dr_no].items.push({
        product_name: row.product_name,
        quantity: row.quantity,
        length: row.length,
        linear_meter: row.linear_meter,
      });
    }

    for (const dr_no in grouped) {
      const group = grouped[dr_no];

      const dr = await DeliveryReceipt.create({
        id: parseInt(dr_no),
        sales_order_id: order.id,
        current_status_id: 2,
      });

      for (const item of group.items) {
        await Item.create({
          ...item,
          delivery_receipt_id: dr.id,
        });
      }
    }

    console.log(`✅ DRs saved from MSSQL for SO ${order.id}`);
  },

  async updateTruckingInfo(drId) {
    const axios = require('axios');
    const DELIVERY_API_BASE = process.env.DELIVERY_API_BASE

    try {
      const res = await axios.get(`${DELIVERY_API_BASE}${drId}`);
      const data = res.data;

      const match = data.find(item => parseInt(item.dr_no) === parseInt(drId));
      if (!match) {
        console.warn(`⚠️ No trucking info found for DR #${drId}`);
        return;
      }
      const updateData = {
        trucking_name: match.trucking,
        plate_number: match.plate_no,
        truck_type: match.truck_type,
      };
      await DeliveryReceipt.update(updateData, { where: { id: drId } });
      console.log(`🚚 DR #${drId} updated with trucking info`);
    } catch (err) {
      console.error(`❌ Failed to update trucking info for DR #${drId}:`, err.message);
    }
  },
};

module.exports = DeliveryService;
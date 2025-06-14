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
    await sql.connect(config);

    const result = await sql.query(`
      SELECT 
        trucking AS trucking_name,
        plate_no AS plate_number,
        truck_type
      FROM VW_DR
      WHERE DRNo = '${drId}'
    `);

    const info = result.recordset[0];
    if (!info) return;

    await DeliveryReceipt.update(
      {
        trucking_name: info.trucking_name,
        plate_number: info.plate_number,
        truck_type: info.truck_type,
      },
      { where: { id: drId } }
    );

    console.log(`🚚 Updated trucking info for DR #${drId}`);
  },
};

module.exports = DeliveryService;
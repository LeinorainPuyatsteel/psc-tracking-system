const express = require('express');
const sql = require('mssql');

const router = express.Router();

const config = {
  user: 'api_user',
  password: 'SapB1Api1',
  server: '192.168.0.27',
  database: 'SAP_API_DB',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  }
};

router.get('/:id', async (req, res) => {
  const id = req.params.id;

  try {
    await sql.connect(config);

    const soResult = await sql.query(`
      SELECT TOP 1
        SONo AS id,
        CardName AS customer_name,
        ContactName AS warehouse_contact_person,
        Address2 AS warehouse_address,
        U_Region AS warehouse_region,
        ISNULL(Tel1, '') + ' ' + ISNULL(Tel2, '') + ' ' + ISNULL(Cellolar, '') AS warehouse_contact_number,
        PSRName AS psr_name
      FROM VW_SO
      WHERE SONo = '${id}'
    `);

    if (soResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Sales Order not found' });
    }

    const so = soResult.recordset[0];

    const itemsResult = await sql.query(`
      SELECT 
        Dscription AS product_name,
        Quantity AS quantity,
        U_Length_FT AS length,
        U_LM AS linear_meter
      FROM VW_SO
      WHERE SONo = '${id}'
    `);

    so.Items = itemsResult.recordset;
    console.log(so.Items);

    res.json(so);
  } catch (err) {
    console.error("❌ MSSQL error:", err);
    res.status(500).json({ error: 'MSSQL fetch failed', details: err.message });
  }
});

module.exports = router;

const express = require('express');
const jwt = require('jsonwebtoken');
const { SalesOrder, Status, Transaction, Item, DeliveryReceipt } = require('../models');
const { UniqueConstraintError } = require('sequelize');
const DeliveryService = require('../services/DeliveryService');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// JWT Auth Middleware
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// GET-ALL SALES ORDER
router.get('/', auth, async (req, res) => {
  try {
    const includeDRs = req.query.includeDRs === 'true';

    const salesOrders = await SalesOrder.findAll({
      include: [
        {
          model: Status,
          as: 'status',
          attributes: ['status'],
        },
        ...(includeDRs ? [
          {
            model: DeliveryReceipt,
            include: [
              { model: Item },
              {
                model: Status,
                as: 'status',
                attributes: ['status'],
              }
            ]
          }
        ] : [])
      ]
    });

    const result = salesOrders.map(order => ({
      id: order.id,
      customer_name: order.customer_name,
      status: order.status?.status,
      current_status_id: order.current_status_id,
      DeliveryReceipts: includeDRs ? order.DeliveryReceipts : undefined,
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = req.body;
    data.current_status_id = 1;

    if (data.DeliveryReceipts && Array.isArray(data.DeliveryReceipts)) {
      data.DeliveryReceipts.forEach(dr => {
        dr.current_status_id = 1;
      });
    }

    if (data.Transactions && Array.isArray(data.Transactions)) {
      data.Transactions.forEach(tx => {
        tx.status_id = 1;
      });
    }

    const order = await SalesOrder.create(data, {
      include: [
        DeliveryReceipt,
        Item,
        Transaction,
      ],
    });

    console.log('Incoming order data:', data);

    res.json({ message: 'Order saved', order });
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      return res.status(400).json({
        error: 'Duplicate entry detected',
        details: err.errors.map((e) => `${e.path}: ${e.message}`),
      });
    } else {
      console.error('❌ Order create failed:', err);
      return res.status(500).json({
        error: 'Server error',
        details: err.message,
      });
    }
  }
});

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads/transactions');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// PUT image upload
router.put('/:id/update-status', auth, upload.single('image'), async (req, res) => {
  try {
    const { status_id } = req.body;
    const { id } = req.params;
    const image_url = req.file ? `/uploads/transactions/${req.file.filename}` : null;

    const order = await SalesOrder.findByPk(id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (status_id < order.current_status_id) {
      return res.status(400).json({ message: 'Cannot move to an earlier status.' });
    }

    order.current_status_id = status_id;
    await order.save();

    const tx = await Transaction.create({
      sales_order_id: id,
      status_id,
      image_url,
    });

    res.json({ message: 'Status updated and image uploaded', transaction: tx });

  } catch (err) {
    console.error('Update with image error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const order = await SalesOrder.findByPk(id, {
      include: [
        { model: Status, as: 'status', attributes: ['status'] },
        { model: Item },
        {
          model: DeliveryReceipt,
          include: [
            { model: Item },
            {
              model: Transaction,
              include: { model: Status, as: 'status' }
            },
            {
              model: Status,
              as: 'status',
              attributes: ['status']
            }
          ]
        },
        {
          model: Transaction,
          include: { model: Status, as: 'status' }
        }
      ]
    });

    if (!order) return res.status(404).json({ error: 'Not found' });

    console.dir(order.toJSON(), { depth: null });

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:id/fetch-delivery-receipts', auth, async (req, res) => {
  try {
    const order = await SalesOrder.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    await DeliveryService.fetchAndAttachReceipts(order); // ⬅️ Clean service call

    res.json({ message: 'Delivery receipts saved for Sales Order', order_id: order.id });
  } catch (err) {
    console.error('❌ Failed to fetch delivery receipts:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

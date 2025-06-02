// routes/orders.js
const express = require('express');
const jwt = require('jsonwebtoken');
const { SalesOrder, Status, Transaction, Item, DeliveryReceipt } = require('../models');

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

// GET /orders - fetch all orders with status
router.get('/', auth, async (req, res) => {
  try {
    const salesOrders = await SalesOrder.findAll({
      include: {
        model: Status,
        as: 'status',
        attributes: ['status'],
      }
    });

    const result = salesOrders.map(order => ({
      id: order.id,
      customer_name: order.customer_name,
      status: order.status?.status,
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /orders/:id - update an order's status
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status_id } = req.body;

    const currentOrder = await SalesOrder.findByPk(req.params.id);
    if (req.body.status_id < currentOrder.status_id) {
      return res.status(400).json({ message: "Cannot move to an earlier status." });
    }

    // Update the Sales Order status
    const order = await SalesOrder.findByPk(id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    order.current_status_id = status_id;
    await order.save();

    // Create a new transaction log
    await Transaction.create({
      sales_order_id: id,
      status_id,
    });

    res.json({ message: 'Status updated and transaction logged' });

  } catch (err) {
    console.error('Error updating order:', err);
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

module.exports = router;

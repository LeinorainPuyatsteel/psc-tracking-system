// routes/orders.js
const express = require('express');
const jwt = require('jsonwebtoken');
const { SalesOrder, Status } = require('../models');

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
      customer: order.customer,
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
    const { status_id } = req.body;

    if (!status_id) {
      return res.status(400).json({ message: 'Missing status_id' });
    }

    // Check if the status_id exists
    const statusExists = await Status.findByPk(status_id);
    if (!statusExists) {
      return res.status(400).json({ message: 'Invalid status_id' });
    }

    const updated = await SalesOrder.update(
      { current_status_id: status_id },
      { where: { id: req.params.id } }
    );

    if (updated[0] > 0) {
      res.sendStatus(200);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (err) {
    console.error('Error updating order:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

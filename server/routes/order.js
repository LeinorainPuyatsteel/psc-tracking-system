const express = require('express');
const jwt = require('jsonwebtoken');
const Order = require('../models/Order');

const router = express.Router();

function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

router.get('/', auth, async (req, res) => {
  const orders = await Order.findAll();
  res.json(orders);
});

router.put('/:id', auth, async (req, res) => {
  await Order.update(
    { status: req.body.status },
    { where: { id: req.params.id } }
  );
  res.sendStatus(200);
});

module.exports = router;

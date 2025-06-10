const express = require('express');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

const {
    SalesOrder,
    Status,
    Transaction,
    Item,
    DeliveryReceipt
} = require('../models');

const router = express.Router();

const multer = require('multer');

const uploadDir = path.join(__dirname, '../uploads/transactions');
fs.mkdirSync(uploadDir, { recursive: true });

function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

router.put('/:id/update-status', auth, upload.single('image'), async (req, res) => {
  console.log("✅ HIT: /delivery-receipts/:id/update-status");
  try {
    const { status_id } = req.body;
    const { id } = req.params;
    const image_url = req.file ? `/uploads/transactions/${req.file.filename}` : null;

    const dr = await DeliveryReceipt.findByPk(id);
    if (!dr) return res.status(404).json({ error: 'Delivery Receipt not found' });

    if (status_id < dr.current_status_id) {
      return res.status(400).json({ message: 'Cannot move to an earlier status.' });
    }

    dr.current_status_id = status_id;
    await dr.save();

    const tx = await Transaction.create({
      delivery_receipt_id: id,
      status_id,
      image_url,
    });

    res.json({ message: 'DR status updated and transaction logged', transaction: tx });

  } catch (err) {
    console.error('❌ DR status update failed:', err);
    res.status(500).json({ error: 'Server error' });
  }
});
module.exports = router;
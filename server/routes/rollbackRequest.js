const express = require('express');
const router = express.Router();
const { StatusChangeRequest, DeliveryReceipt } = require('../models');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const requests = await StatusChangeRequest.findAll({
        where: {status: 'pending'}
    });
    console.log('Received query:', requests);

    res.json(requests);
  } catch (err) {
    console.error('Failed to fetch rollback requests:', err);
    res.status(500).json({ error: 'Failed to fetch rollback requests' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { delivery_receipt_id, from_status, to_status, note } = req.body;

    const requested_by = req.user?.id;

    const request = await StatusChangeRequest.create({
      delivery_receipt_id,
      from_status,
      to_status,
      note,
      requested_by,
      approved: false,
    });

    res.status(201).json({ message: 'Rollback request submitted.', request });
  } catch (err) {
    console.error('Rollback submit error:', err);
    res.status(500).json({ error: 'Failed to submit rollback request' });
  }
});

router.post('/:id/approve', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const rollback = await StatusChangeRequest.findByPk(id);
    if (!rollback) return res.status(404).json({ message: 'Rollback request not found' });

    const dr = await DeliveryReceipt.findByPk(rollback.delivery_receipt_id);
    if (!dr) return res.status(404).json({ message: 'Delivery receipt not found' });

    dr.current_status_id = rollback.to_status;
    await dr.save();

    rollback.status = 'approved';
    rollback.approved = true;
    rollback.approved_by = req.user?.id ?? null;
    rollback.approved_at = new Date();
    await rollback.save();

    res.json({ message: 'Rollback request approved successfully.' });
  } catch (err) {
    console.error('Approval error:', err);
    res.status(500).json({ error: 'Approval failed' });
  }
});

router.post('/:id/reject', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const rollback = await StatusChangeRequest.findByPk(id);
    if (!rollback) return res.status(404).json({ message: 'Rollback request not found' });

    rollback.status = 'rejected';
    rollback.approved_by = req.user?.id ?? null;
    rollback.approved_at = new Date();
    await rollback.save();

    res.json({ message: 'Rollback request rejected successfully.' });
  } catch (err) {
    console.error('Rejection error:', err);
    res.status(500).json({ error: 'Rejection failed' });
  }
});

module.exports = router;

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { Op } = require('sequelize');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ where: { username } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { 
      id: user.id,
      username: user.username,
      role: user.role,
    }, 
    process.env.JWT_SECRET);
  res.json({ token });
});

router.post('/register', async (req, res) => {
  const hashed = await bcrypt.hash(req.body.password, 10);
  await User.create({ username: req.body.username, password: hashed });
  res.status(201).send();
});

// GET /api/auth/me
router.get('/me', auth, (req, res) => {
  console.log('User info being sent:', req.user);
  console.log('---- /me called ----');
  console.log('User ID:', req.user.id);
  console.log('Username:', req.user.username);
  console.log('Role:', req.user.role);
  res.set('Cache-Control', 'no-store');
  res.json({
    id: req.user.id,
    username: req.user.username,
    role: req.user.role,
  });
});

module.exports = router;

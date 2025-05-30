const express = require('express');
const cors = require('cors');
const sequelize = require('./database');
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/order');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

sequelize.sync().then(() => {
  console.log('JWT_SECRET:', process.env.JWT_SECRET)
  console.log('MySQL connected & models synced');
  app.listen(5000, '0.0.0.0', () => console.log('Server running on port 5000'));
  // app.listen(5000, () => console.log('Server running on port 5000')); for prod
}).catch(err => console.error('DB connection failed:', err));

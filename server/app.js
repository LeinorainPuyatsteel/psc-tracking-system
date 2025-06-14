const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/order');
const deliveryRoutes = require('./routes/deliveryReceipt');
const sapSORoute = require('./routes/sapSalesOrder');
const rollbackRequestRoutes = require('./routes/rollbackRequest');
const path = require('path');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static('public'));

app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/sap-so', sapSORoute);

app.use('/api/delivery-receipts', deliveryRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/rollback-requests', rollbackRequestRoutes);
app.use('/api/rollback-request', rollbackRequestRoutes);

sequelize.sync().then(() => {
  console.log('JWT_SECRET:', process.env.JWT_SECRET)
  console.log('MySQL connected & models synced');
  app.listen(5000, '0.0.0.0', () => console.log('Server running on port 5000'));
  // app.listen(5000, () => console.log('Server running on port 5000')); for prod
}).catch(err => console.error('DB connection failed:', err));

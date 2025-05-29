const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./database');
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/order');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

sequelize.sync().then(() => {
  console.log('MySQL connected & models synced');
  app.listen(5000, () => console.log('Server running on port 5000'));
}).catch(err => console.error('DB connection failed:', err));

const sequelize = require('./database');
const Order = require('./models/Order');

const seed = async () => {
  await sequelize.sync({ force: true });

  await Order.bulkCreate([
    { id: 1001, customer: 'Alpha Corp', status: 'Sales Order Being Prepared' },
    { id: 1002, customer: 'Beta Inc', status: 'Fully Prepared, Transferred to Loading Area' },
    { id: 1003, customer: 'Gamma Ltd', status: 'Loading is Ongoing' },
    { id: 1004, customer: 'Delta Co', status: 'Fully Loaded and Ready for Dispatch' },
    { id: 1005, customer: 'Epsilon LLC', status: 'Fully Loaded and Waiting for Dispatch' },
    { id: 1006, customer: 'Zeta Traders', status: 'Truck is Being Weighed' },
    { id: 1007, customer: 'Eta Services', status: 'Ready for Dispatch with no Discrepancy' },
  ]);

  console.log('Seed complete');
  process.exit();
};

seed();

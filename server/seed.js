const bcrypt = require('bcrypt');
const {
  sequelize,
  SalesOrder,
  Transaction,
  Status,
  User
} = require('./models');

const seed = async () => {
  await sequelize.sync({ force: true });

  // Seed user
  const hashed = await bcrypt.hash('admin', 10);
  await User.create({
    username: 'admin',
    password: hashed,
    user_type: 'admin'
  });

  // Seed status
  await Status.bulkCreate([
    { status: 'Sales Order is Being Prepared' },
    { status: 'Sales Order has been Fully Prepared and Transferred to the Loading Area' },
    { status: 'Loading is Ongoing' },
    { status: 'Fully Loaded' },
    { status: 'Waiting to be Dispatched' },
    { status: 'Truck is Being Weighed' },
    { status: 'Ready for Dispatch with no Discrepancy' },
    { status: 'Truck is Dispatched' }
  ]);

  // Seed sales orders
  const salesOrders = await SalesOrder.bulkCreate([
    { customer: 'Alpha Corp', current_status_id: 1 },
    { customer: 'Beta Inc', current_status_id: 1 },
    { customer: 'Gamma Ltd', current_status_id: 1 },
    { customer: 'Delta Co', current_status_id: 1 },
    { customer: 'Epsilon Llc', current_status_id: 1 },
    { customer: 'Zeta Traders', current_status_id: 1 },
    { customer: 'Eta Services', current_status_id: 1 }
  ], { returning: true });

  // Seed transactions using the correct auto-generated IDs
  await Transaction.bulkCreate(salesOrders.map(order => ({
    sales_order_id: order.id,
    status_id: 1
  })));

  console.log('✅ Seed complete: User, Status, Orders, and Transactions created');
  process.exit();
};

seed();

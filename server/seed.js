const bcrypt = require('bcrypt');
const {
  sequelize,
  SalesOrder,
  Transaction,
  Status,
  User,
  DeliveryReceipt,
  Item
} = require('./models');

const getRandom = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomFloat = (min, max, decimals = 2) =>
  parseFloat((Math.random() * (max - min) + min).toFixed(decimals));

const seed = async () => {
  await sequelize.sync({ force: true });

  // Create admin user
  const hashed = await bcrypt.hash('password', 10);
  await User.create({
    username: 'admin',
    password: hashed,
    role: 'admin'
  });

  await User.create({
    username: 'clet',
    password: hashed,
    role: 'clet'
  });

  await User.create({
    username: 'girlie',
    password: hashed,
    role: 'girlie'
  });

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

  const sampleCustomers = [
    { id: 14915, name: 'Alpha Corp', address: '123 Alpha Street', contact: '1234567890' },
    { id: 16459, name: 'Beta Inc', address: '456 Beta Avenue', contact: '2345678901' },
    { id: 15334, name: 'Gamma Ltd', address: '789 Gamma Blvd', contact: '3456789012' },
  ];

  for (const customer of sampleCustomers) {
    // Create sales order
    const salesOrder = await SalesOrder.create({
      id: customer.id,
      customer_name: customer.name,
      customer_address: customer.address,
      customer_contact_number: customer.contact,
      current_status_id: 1
    });

    await Transaction.create({
      sales_order_id: salesOrder.id,
      status_id: 1
    });
  }

  console.log('✅ Full seed complete: Users, Statuses, Sales Orders, DRs, Items, and Transactions.');
  process.exit();
};

seed();

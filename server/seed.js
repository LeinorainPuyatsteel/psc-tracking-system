const bcrypt = require('bcrypt');
const {
  sequelize,
  SalesOrder,
  Transaction,
  Status,
  User,
  DeliveryReceipt,
  Item,
  StatusChangeRequest
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

  await User.create({
    username: 'amado',
    password: hashed,
    role: 'amado'
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
    {
      id: 14915,
      name: 'Alpha Corp',
      address: '123 Alpha Street',
      contact: '1234567890',
      warehouse_contact_person: 'Juan',
      warehouse_region: 'NCR',
      psr_name: 'Steven'
    },
    {
      id: 16459,
      name: 'Beta Inc',
      address: '456 Beta Avenue',
      contact: '2345678901',
      warehouse_contact_person: 'Maria',
      warehouse_region: 'Region IV-A',
      psr_name: 'Harry'
    },
    {
      id: 15334,
      name: 'Gamma Ltd',
      address: '789 Gamma Blvd',
      contact: '3456789012',
      warehouse_contact_person: 'Jose',
      warehouse_region: 'Region III',
      psr_name: 'Charlie'
    }
  ];

  for (const customer of sampleCustomers) {
    // Create sales order
    const salesOrder = await SalesOrder.create({
      id: customer.id,
      customer_name: customer.name,
      warehouse_address: customer.address,
      warehouse_contact_number: customer.contact,
      warehouse_contact_person: customer.warehouse_contact_person,
      warehouse_region: customer.warehouse_region,
      psr_name: customer.psr_name,
      current_status_id: 1
    });

    const itemCount = getRandom(4, 8);
    const items = Array.from({ length: itemCount }).map((_, i) => ({
      sales_order_id: salesOrder.id,
      product_name: `Product ${i + 1}`,
      quantity: getRandomFloat(1, 10),
      thickness: getRandomFloat(0.5, 2),
      width: getRandom(100, 300),
      length: getRandom(100, 1000),
      linear_meter: getRandomFloat(1, 50),
      metric_tons: getRandomFloat(1, 50)
    }));

    await Item.bulkCreate(items);

    await Transaction.create({
      sales_order_id: salesOrder.id,
      status_id: 1
    });
  }
};

seed();

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

  // Create statuses
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
    { name: 'Alpha Corp', address: '123 Alpha Street', contact: '1234567890' },
    { name: 'Beta Inc', address: '456 Beta Avenue', contact: '2345678901' },
    { name: 'Gamma Ltd', address: '789 Gamma Blvd', contact: '3456789012' },
    { name: 'Delta Co', address: '101 Delta Drive', contact: '4567890123' },
    { name: 'Epsilon LLC', address: '202 Epsilon Way', contact: '5678901234' },
    { name: 'Zeta Traders', address: '303 Zeta Road', contact: '6789012345' },
    { name: 'Eta Services', address: '404 Eta Lane', contact: '7890123456' }
  ];

  for (const customer of sampleCustomers) {
    // Create sales order
    const salesOrder = await SalesOrder.create({
      customer_name: customer.name,
      customer_address: customer.address,
      customer_contact_number: customer.contact,
      current_status_id: 1
    });

    // Create between 1–3 delivery receipts
    const drCount = getRandom(1, 1);
    const deliveryReceipts = await Promise.all(
      Array.from({ length: drCount }).map(() =>
        DeliveryReceipt.create({
          sales_order_id: salesOrder.id,
          current_status_id: 1
        })
      )
    );

    // Create 4–10 items
    const itemCount = getRandom(4, 10);
    const items = Array.from({ length: itemCount }).map((_, i) => ({
      sales_order_id: salesOrder.id,
      product_name: `Product ${i + 1}`,
      quantity: getRandomFloat(1, 10),
      thickness: getRandomFloat(0.5, 2),
      width: getRandom(100, 300),
      length: getRandom(100, 1000),
      linear_meter: getRandomFloat(1, 50)
    }));

    // Distribute items across delivery receipts
    const itemsPerDr = Math.ceil(itemCount / drCount);
    let itemIndex = 0;

    for (const dr of deliveryReceipts) {
      const chunk = items.slice(itemIndex, itemIndex + itemsPerDr).map(item => ({
        ...item,
        delivery_receipt_id: dr.id
      }));
      await Item.bulkCreate(chunk);
      itemIndex += itemsPerDr;

      // Create transaction per delivery receipt
      await Transaction.create({
        sales_order_id: salesOrder.id,
        delivery_receipt_id: dr.id,
        status_id: 1
      });
    }
  }

  console.log('✅ Full seed complete: Users, Statuses, Sales Orders, DRs, Items, and Transactions.');
  process.exit();
};

seed();

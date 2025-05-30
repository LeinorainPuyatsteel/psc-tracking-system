cat > README.md << 'EOF'
# PSC Tracking System

**A web-based system to track the status and progress of sales orders through various logistics stages.**

## 🚀 Features

- Track real-time status of sales orders
- Mobile-friendly / Responsive UI
- Secure authentication with **bcrypt**
- Easy environment configuration using **dotenv**
- Clean UI with **Bootstrap** and **FontAwesome**
- Dockerized for deployment
- MySQL database with **Sequelize ORM**
- Built with **Node.js** and **Vue.js**

## 🔄 Sales Order Stages

1. **Sales Order Being Prepared**
2. **Fully Prepared, Transferred to Loading Area**
3. **Loading is Ongoing**
4. **Fully Loaded and Ready for Dispatch**
5. **Fully Loaded and Waiting for Dispatch**
6. **Truck is Being Weighed**
7. **Ready for Dispatch with No Discrepancy**

## 🧱 Tech Stack

- **Frontend:** Vue.js  
- **Backend:** Node.js  
- **Database:** MySQL (via Sequelize ORM)  
- **Authentication:** Bcrypt  
- **Environment Config:** Dotenv  
- **UI:** Bootstrap, FontAwesome  
- **Deployment:** Docker  

## 📁 Repository

GitHub: [https://github.com/LeinorainPuyatsteel/psc-tracking-system](https://github.com/LeinorainPuyatsteel/psc-tracking-system)

## TO DO LIST:

~~ - Modify DB ~~
    ~~ - Add customer columns / fields, item columns / fields in sales_order table / model. ~~
    ~~ - Create delivery_receipt and items Table / Model and its associated Column / Fields ~~
        ~~ delivery_receipt_table ~~
        ~~ - id ~~
        ~~ - sales_order_id ~~
        ~~ - current_status_id ~~
        ~~ item table ~~
        ~~ - id ~~
        ~~ - product_name ~~
        ~~ - quantity ~~
        ~~ - thickness ~~
        ~~ - width ~~
        ~~ - length ~~
        ~~ - linear_meter ~~
- SO View
    - Clet -> No Prodcut Details
    - Girlie -> No Contact Info
- API Handler
    - Add SO
- Misc
    - Search Button

## FUTURE UPDATES:
    - Use Composite Keys
    - Enforce more strict Constraints in DB
    - Pivot Tables on Many-to-Many relationships
    - Rename transaction table to status_log or activity_log
    - DB validation rules (check if may apply to API)

## API DETAILS:
    sales_order_id = U_SONo
    delivery_receipt_id = ?

    customer_name = CardName
    customer_address = Address2 + Address
    customer_contact_number = ?

    product_name = Description
    quantity = Quantity + unitMsr
    thickness = U_NThickness
    width = U_NWidth
    length = LengthInFt + Feet
    linear_meter = LinearMeter

EOF

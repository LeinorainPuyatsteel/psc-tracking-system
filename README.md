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

<strike>
Modify DB<br>
    Add customer columns / fields, item columns / fields in sales_order table / model.<br>
    Create delivery_receipt and items Table / Model and its associated Column / Fields<br>
        delivery_receipt_table<br>
            id<br>
            sales_order_id<br>
            current_status_id<br>
        item table<br>
            id<br>
            product_name<br>
            quantity<br>
            thickness<br>
            width<br>
            length<br>
            linear_meter<br>
Do not allow going back of stage<br>
Misc
    Message template
SO View
    Clet -> No Product Details
    Girlie -> No Contact Info
API based dummy adding of SO (presentation purposes)
API based dummy of adding SO (presentation purposes)
Implement image upload when changing status and viewing as modal on Sales Order View via transaction logs
Show only SO from
    STAGE #1 - Sales Order is Being Prepared
SHOW DR from
    STAGE #2 - Sales Order has been Fully Prepared and Transferred to the Loading Area
    STAGE #8 - Truck is Dispatched
Fetch DR through API when moved from STAGE #1 to STAGE #2

Misc 
Fix select status not changing back to previous state when upload is cancelled
Fix card not clickable on mobile view
Fix selection not working on mobile
Make the palette white
</strike>

- Tonnage of SO 
- +1 stage update only
- Bringing back of stage require admin approval and notes
- New Stage - Received by customer
- Add DR button (delayed DR, partial)
- Group DR per SO per Truck
    - If one SO have multiple DR, automatically multiple truck
    - One truck can have multiple customer (SO + DR)
- API Handler
    - Add SO
- Misc
    - Search Button (Search by SO, by DR, & by Customer Name)
    - Different accounts per stages
    - Minimal statistics (list of so/dr per stages, total ongoing, total dispatched, total so, total dr)
    - Admin vue: Dashboard with statistics
    - Iphone support for image upload

## FIXES:
    - Bring back SO (from stage 1 to 2) if no DR available, show error

## FUTURE UPDATES:
    - Use Composite Keys
    - Enforce more strict Constraints in DB
    - Pivot Tables on Many-to-Many relationships
    - Rename transaction table to status_log or activity_log
    - DB validation rules (check if may apply to API)
    - Image upload compression (important, before deployment)

## API DETAILS:
    Sales Order Table:
    id = U_SONo
    customer_name = CardName
    warehouse_contact_person = ContactName
    warehouse_address = Address2
    warehouse_region = U_Region
    warehouse_contact_number = Tel1 +,Tel2 +, Cellolar
    psr_name = PSRName
    
    Delivery Receipt:
    id = DRNo

    Items Table:
    product_name = Description
    quantity = Quantity
    length = U_Length_FT
    linear_meter = U_LM

EOF

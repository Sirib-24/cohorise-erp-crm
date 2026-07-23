# Cohorise ERP & CRM

A full-stack ERP & CRM web application developed to streamline customer management, inventory tracking, sales operations, invoicing, payments, and follow-ups within a single platform.

---

## Features

### Authentication
- Secure Login using JWT Authentication
- Role-Based Access Control
- Admin
- Sales
- Warehouse
- Accounts

---

### Dashboard
- Total Customers
- Total Products
- Pending Follow-ups
- Low Stock Products
- Recent Activities
- Business Overview

---

### Customer Management
- Add Customers
- Edit Customer Details
- Delete Customers
- Search Customers
- Customer Status Management

---

### Product Management
- Add Products
- Update Products
- Delete Products
- Inventory Tracking
- Low Stock Alerts
- Stock Movement History

---

### Challan Management
- Create Challans
- View Challans
- Customer-wise Challans
- Product-wise Challans

---

### Follow-up Management
- Schedule Follow-ups
- Update Follow-up Status
- Track Pending Follow-ups

---

### Invoice Management
- Generate Invoices
- Invoice Listing
- Invoice Status

---

### Payment Management
- Record Payments
- Payment History
- Pending Payment Tracking

---

## Tech Stack

### Frontend
- React.js
- React Router DOM
- Axios
- CSS3
- Vite

### Backend
- Node.js
- Express.js
- JWT Authentication
- bcrypt
- MySQL2

### Database
- MySQL (Aiven Cloud Database)

---

## Folder Structure

```
mini-erp-crm
│
├── backend
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── server.js
│   └── package.json
│
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── api
│   │   └── App.jsx
│   └── package.json
│
└── README.md
```

---

## Installation

### Clone Repository

```bash
git clone <repository-url>
```

---

### Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder.

```
PORT=5000

DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name

JWT_SECRET=your_secret_key
```

Start backend

```bash
npm start
```

---

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## User Roles

### Admin
- Full Access

### Sales
- Customers
- Challans
- Follow-ups

### Warehouse
- Products
- Inventory

### Accounts
- Invoices
- Payments

---

## API Modules

- Authentication
- Dashboard
- Customers
- Products
- Challans
- Follow-ups
- Invoices
- Payments

---

## Future Enhancements

- Email Notifications
- PDF Invoice Generation
- Analytics Dashboard
- Reports
- Sales Charts
- Export to Excel
- SMS Notifications
- Multi-Branch Support

---

## Author

**Siri B**

Cyber Security Engineering Student

---

## License

This project is developed for educational and portfolio purposes.

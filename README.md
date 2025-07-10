# 📦 Smart Inventory Management System
<img width="1366" height="598" alt="Image" src="https://github.com/user-attachments/assets/3b2d1e61-daea-4f5a-9479-de19a9490810" />

A full-stack web application that enables efficient inventory redistribution among retail stores based on real-time stock and demand levels. This system minimizes wastage, optimizes stock transfers, and enhances the customer experience.

---
## 🧠 Overview

Retail companies with multiple store locations often face challenges in managing uneven stock and fluctuating product demand. One store may be overstocked on an item with little demand, while another nearby store may have high demand and insufficient supply. Traditional solutions rely heavily on centralized warehouses, leading to delays and wastage—especially for perishable goods.

This Smart Inventory Management System helps:

- Recommend intelligent stock transfers between stores
- Minimize wastage (e.g., for products nearing expiry)
- Save fuel and logistics costs
- Improve operational efficiency and customer satisfaction

> ⚠️ **Note:** Since this is a standalone project and not integrated with a retail store’s billing or purchase systems, the demand for each product **cannot be auto-generated**. Instead, **demand levels must be manually set** per store-product pair using the **Demand Manager panel**.

---

## 🔧 Tech Stack

**Frontend:**

- React.js (via Next.js framework)  
- TypeScript  
- Tailwind CSS  
- SWR (for real-time data fetching)

**Backend:**

- Node.js  
- Express.js

**Database:**

- MongoDB (with Mongoose ODM)

**Other Tools:**

- Git & GitHub  
- MongoDB Compass (for local DB management)

---

## 🚀 Features

✅ View and update inventory by store  
✅ Set and manage product demand levels manually  
✅ Intelligent stock transfer recommendations  
✅ Manager panel for approving/rejecting transfers  
✅ Smart alerts for low stock and demand mismatches  
✅ Searchable filters on every panel  
✅ Dark-themed modern UI with reusable components

<img width="1366" height="597" alt="Image" src="https://github.com/user-attachments/assets/a2a63d2c-f862-450f-ad6e-84e75f2caa5f" />
<img width="1366" height="602" alt="Image" src="https://github.com/user-attachments/assets/8fcf681f-687e-40f3-b82d-4d12d4ca075a" />
<img width="1320" height="586" alt="Image" src="https://github.com/user-attachments/assets/adb5e680-6c0e-4d95-b408-75a2235036e0" />
<img width="1366" height="587" alt="Image" src="https://github.com/user-attachments/assets/dea030aa-fdfc-4a69-906f-9894a1bc85fd" />

> ⚙️ **Transfer Logic Thresholds:**
- ✅ If stock is **greater than 200 units** and demand is **low**, the store becomes eligible to donate that item — but only the quantity **above 200**.
- ✅ If stock is **less than 100 units** and demand is **medium or high**, the system tries to find a donor store or suggest sourcing from a warehouse.
- ✅ If stock is **less than 50 units**, a **low stock warning** is shown **regardless of demand**.
- ❗ If **demand is not manually set**, the system assumes it to be **low by default** for that item in that store.

---

## 🛠️ Local Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/Abhi-0703/Smart-Inventory-Management
cd Smart-Inventory-Management-System
```
### 2. Install dependencies
Backend
```bash
cd backend
npm install
```
Frontend
```bash
cd ../frontend
npm install
```
### 3. Set up local MongoDB
 - Make sure MongoDB is installed and running on your machine.

 - No need to create a .env file — this version uses hardcoded localhost URLs and assumes your MongoDB URI is the default.
### 4. Run the backend
```bash
cd backend
npm start
```
The backend will run at http://localhost:5000.
### 5. Run the frontend
```bash
cd ../frontend
npm run dev
```
The frontend will run at http://localhost:3000.

---
## 🧪 How to Use
1) Launch the dashboard

2) Add inventory items store-wise

3) Set demand levels for each product manually using the Demand Manager

4) Visit the Recommendations page to view smart stock transfer suggestions

5) Submit a transfer request

6) Go to the Manager Panel to approve/reject pending requests
> 💡 Demand levels must be manually set to medium or high when required. If left unset, the system assumes the demand is low by default, which affects whether stock is transferable or a warning is issued.

---
## 📂 Folder Structure
```bash
Smart-Inventory-Management/
├── backend/
│   ├── Models/
│   ├── Routes/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   └── pages/
│   └── package.json
```
---
## 📌 Real-Life Use Cases
- A school-area store sees high demand for stationery and juice packs, while another store in a residential zone is overstocked. Instead of sourcing from a warehouse, the system recommends a store-to-store transfer.
- Ready-to-eat meals or batteries that are nearing expiry in one location can be sent to a high-demand store to reduce waste and maintain freshness.

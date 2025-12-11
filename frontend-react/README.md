
# 📦 **PharmaTrade Connect — Full Stack B2B Medicine Ordering Platform**

PharmaTrade Connect is a full-stack web platform designed for **Admins** and **Retailers** to manage medicine inventory, handle retailer onboarding, and place orders smoothly.

This project includes:

* ✅ **Admin Dashboard** (Inventory, Orders, Retailer Requests)
* ✅ **Retailer Dashboard** (View products, add to cart, checkout)
* ✅ **Authentication System** (Login as Admin or Retailer)
* ✅ **Retailer Signup with License Upload**
* ✅ **Protected Routes** for Admin & Retailer
* ✅ **Cart & Order Flow** with UI enhancements

---

## 🚀 **Tech Stack**

### **Frontend**

* React + TypeScript
* Vite
* Tailwind CSS
* React Router DOM

### **Backend**

* Node.js / Express
* JWT Authentication
* Multer for file uploads
* PostgreSQL / MongoDB (depends on your backend setup)

---

# 🔧 **Project Setup**

## 1️⃣ **Install Dependencies**

```sh
npm install
```

## 2️⃣ **Start Frontend (Vite)**

```sh
npm run dev
```

Frontend runs at:
👉 **[http://localhost:5173](http://localhost:5173)**

## 3️⃣ **Start Backend**

```sh
npm start
```

Backend runs at:
👉 **[http://localhost:8080](http://localhost:8080)**

---

# 🔐 **Authentication Flow**

### **Login Modes**

* **Admin Login** → Redirects to `/admin`
* **Retailer Login** → Redirects to `/retailer`

### **Signup**

Signup is **only for Retailers** and requires:

* Full Name
* Email
* Password
* License Number
* License File (PDF/PNG/JPG)

Admin is created **manually or from backend only**.

---

# 🧭 **Frontend Routes**

| Route             | Role     | Description         |
| ----------------- | -------- | ------------------- |
| `/`               | Public   | Login / Signup      |
| `/retailer`       | Retailer | Products Dashboard  |
| `/cart`           | Retailer | Cart & Checkout     |
| `/admin`          | Admin    | Inventory Dashboard |
| `/admin/orders`   | Admin    | Order History       |
| `/admin/requests` | Admin    | Retailer Approvals  |

---

# 🛒 **Retailer Features**

### ✔ Product Dashboard

* View all available medicines
* Add to cart
* Product card turns green when added

### ✔ Cart Page

* Update quantity
* Remove product
* Delivery charge ₹27
* Place order

### ✔ Order Success Redirect

After order success → redirect to `/retailer` without logging out.

---

# 🛠 Admin Features

### ✔ Inventory Management

* View medicines
* Stock levels
* Status badges (Low, Out of Stock)

### ✔ Order History

* Order record table

### ✔ Retailer Requests

* Approve / Reject retailers
* Revoke access

---

# 📁 **Project Folder Structure**

```
src/
 ├── components/
 │   ├── ui/
 │   │   ├── Sidebar.tsx
 │   │   ├── NavItem.tsx
 │   │   ├── AnimatedContainer.tsx
 │   │   ├── Skeleton.tsx
 │   │   ├── GlassCard.tsx
 │   │   ├── PageHeader.tsx
 │   ├── functional/
 │       ├── InventoryTable.tsx
 │       ├── OrderHistoryTable.tsx
 │       ├── RequestsTable.tsx
 │
 ├── pages/
 │   ├── Login.tsx
 │   ├── RetailerDashboard.tsx
 │   ├── CartPage.tsx
 │   ├── admin/
 │       ├── AdminDashboard.tsx
 │       ├── AdminInventory.tsx
 │       ├── OrderHistory.tsx
 │       ├── Requests.tsx
 │
 ├── App.tsx
 └── main.tsx
```

---

# 🧪 **Testing Admin Login**

Use sample mock credentials:

```
Admin:
email: admin@pharma.com
password: Admin@123
role: ADMIN
```

# 🧪 **Testing Retailer Login**

Retailer must be approved by Admin.

---

# 🎯 Roadmap

* Payment integration
* Notifications for stock alerts
* Reports & analytics
* Multi-admin roles

---

# 🤝 Contribution

1. Create new branch
2. Push changes
3. Open Pull Request
4. Add description and screenshots

---

# 📝 Example Pull Request Description

```
Added Admin Inventory Page + Sidebar Integration

✔ Created AdminInventory.tsx
✔ Added summary stat cards
✔ Integrated InventoryTable component
✔ Updated routing in App.tsx

Next TODO:
- Connect all tables to backend API
- Add pagination and sorting
```



import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Retailer pages
import Login from "./pages/Login";
import RetailerDashboard from "./pages/RetailerDashboard";
import CartPage from "./pages/CartPage";

// Admin pages
import AdminDashboard from "./pages/AdminDashboard"; 
// (AdminDashboard.tsx exists, so this is fine)

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ---------- PUBLIC ROUTES ---------- */}
        <Route path="/" element={<Login />} />

        {/* ---------- RETAILER ROUTES ---------- */}
        <Route path="/retailer" element={<RetailerDashboard />} />
        <Route path="/cart" element={<CartPage />} />

        {/* ---------- ADMIN ROUTES ---------- */}
        {/* AdminDashboard will internally handle:
            /admin/inventory
            /admin/orders
            /admin/requests
        */}
        <Route path="/admin/*" element={<AdminDashboard />} />

        {/* ---------- CATCH ALL ---------- */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </BrowserRouter>
  );
}

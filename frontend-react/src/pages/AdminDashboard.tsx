import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "../components/ui/Sidebar";
import AdminInventory from "./AdminInventory";
import OrderHistory from "./OrderHistory";
import Requests from "./Requests";

export default function AdminDashboard() {
  return (
    <div className="flex">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="ml-64 p-6 w-full">
        <Routes>
          {/* Default admin route → show inventory */}
          <Route path="/" element={<AdminInventory />} />

          {/* Admin pages */}
          <Route path="orders" element={<OrderHistory />} />
          <Route path="requests" element={<Requests />} />

          {/* If unknown admin route → stay inside /admin */}
          <Route path="*" element={<Navigate to="/admin" />} />
        </Routes>
      </div>
    </div>
  );
}

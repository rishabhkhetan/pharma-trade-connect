import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import RetailerDashboard from "./pages/RetailerDashboard";
import CartPage from "./pages/CartPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<RetailerDashboard />} />
        <Route path="/cart" element={<CartPage />} />
      </Routes>
    </BrowserRouter>
  );
}

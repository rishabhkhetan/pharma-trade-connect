// src/pages/RetailerDashboard.tsx
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar"; // ✅ using real navbar

// ----------------------
// Types
// ----------------------
type Product = {
  id: number;
  name: string;
  brand?: string;
  price: number;
  stock: number;
};

type CartItem = {
  product: Product;
  quantity: number;
};

export default function RetailerDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  // Simulated login (REMOVE after backend)
  const token = "dummy";
  const role = localStorage.getItem("role") || "RETAILER";
  const isApproved = localStorage.getItem("is_approved") || "YES";

  // ----------------------
  // Load Products - MOCK DATA
  // ----------------------
  const fetchProducts = () => {
    setLoadingProducts(true);

    const mock: Product[] = [
      { id: 1, name: "Paracetamol 650mg", brand: "Cipla", price: 35, stock: 120 },
      { id: 2, name: "Azithromycin 500mg", brand: "Sun Pharma", price: 90, stock: 50 },
      { id: 3, name: "Amoxicillin 500mg", brand: "Alkem", price: 80, stock: 20 },
      { id: 4, name: "Cough Syrup", brand: "Himalaya", price: 110, stock: 0 },
    ];

    setTimeout(() => {
      setProducts(mock);
      setLoadingProducts(false);
    }, 300);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ----------------------
  // Cart Functions
  // ----------------------
  const addToCart = (p: Product) => {
    setCart((prev) => {
      const updated = [...prev];
      const exists = updated.find((c) => c.product.id === p.id);

      if (exists) {
        exists.quantity = Math.min(exists.quantity + 1, p.stock);
      } else {
        updated.push({ product: p, quantity: 1 });
      }

      localStorage.setItem("cart", JSON.stringify(updated));
      return updated;
    });
  };

  const getCartCount = () =>
    cart.reduce((sum, item) => sum + item.quantity, 0);

  // ----------------------
  // Product Card UI
  // ----------------------
  const ProductCard = ({ p }: { p: Product }) => {
    const inCart = cart.find((c) => c.product.id === p.id);

    return (
      <div
        className={`p-4 rounded shadow border transition ${
          inCart ? "bg-green-50 border-green-500" : "bg-white"
        }`}
      >
        <h3 className="font-semibold text-lg">{p.name}</h3>
        <p className="text-gray-500 text-sm">{p.brand}</p>

        <div className="mt-3 flex justify-between items-center">
          <div>
            <p className="font-bold text-blue-600">₹{p.price}</p>
            <p
              className={`text-sm ${
                p.stock > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}
            </p>

            {inCart && (
              <p className="text-xs text-green-600 mt-1 font-bold">✓ Added</p>
            )}
          </div>

          <button
            onClick={() => addToCart(p)}
            disabled={p.stock === 0}
            className={`px-3 py-1 rounded text-white text-sm ${
              p.stock === 0
                ? "bg-gray-400 cursor-not-allowed"
                : inCart
                ? "bg-green-600 hover:bg-green-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {inCart ? "Added ✓" : "Add"}
          </button>
        </div>
      </div>
    );
  };

  // ----------------------
  // MAIN UI
  // ----------------------
  return (
    <div className="min-h-screen bg-gray-100">
      
      {/* Navbar with cart badge */}
      <Navbar cartCount={getCartCount()} />

      <div className="max-w-6xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">Products</h2>

        {loadingProducts ? (
          <p>Loading…</p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

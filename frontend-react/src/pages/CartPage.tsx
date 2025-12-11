// src/pages/CartPage.tsx
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

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

export default function CartPage() {
  const DELIVERY_CHARGE = 27;

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Save cart always
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const changeQuantity = (id: number, qty: number) => {
    setCart((prev) =>
      prev
        .map((c) =>
          c.product.id === id ? { ...c, quantity: Math.max(1, qty) } : c
        )
        .filter((c) => c.quantity > 0)
    );
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((c) => c.product.id !== id));
  };

  const getSubtotal = () =>
    cart.reduce((total, c) => total + c.product.price * c.quantity, 0);

  const getTotalAmount = () => getSubtotal() + DELIVERY_CHARGE;

  const placeOrder = () => {
    if (cart.length === 0) return;

    setPlacingOrder(true);

    setTimeout(() => {
      setOrderSuccess(true);
      setCart([]);
      localStorage.removeItem("cart");
      setPlacingOrder(false);
    }, 700);
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar cartCount={0} />

        <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-6 mt-10 text-center">
          <h2 className="text-2xl font-bold text-green-600">
            🎉 Order Placed Successfully!
          </h2>
          <p className="text-gray-600 mt-2">
            Your medicines will be delivered soon.
          </p>

          <button
            className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => (window.location.href = "/retailer")}
          >
            Back to Prodcuts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar cartCount={cart.length} />

      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Your Cart</h1>

        {cart.length === 0 ? (
          <div className="bg-white p-6 rounded shadow text-center text-gray-600">
            Your cart is empty.
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">

            {/* CART ITEMS */}
            <div className="md:col-span-2 space-y-4">
              {cart.map((c) => (
                <div
                  key={c.product.id}
                  className="bg-white p-4 rounded shadow flex justify-between"
                >
                  <div>
                    <p className="font-semibold">{c.product.name}</p>
                    <p className="text-gray-500 text-sm">
                      ₹{c.product.price} × {c.quantity}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={c.product.stock}
                      value={c.quantity}
                      onChange={(e) =>
                        changeQuantity(c.product.id, Number(e.target.value))
                      }
                      className="w-16 border rounded px-2 py-1"
                    />

                    <button
                      onClick={() => removeFromCart(c.product.id)}
                      className="text-red-600 font-bold text-lg"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* BILLING SUMMARY */}
            <div className="bg-white p-4 rounded shadow h-fit">
              <h2 className="text-lg font-bold mb-3">Billing Summary</h2>

              <div className="flex justify-between text-sm mb-2">
                <span>Subtotal</span>
                <span>₹{getSubtotal().toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-sm mb-2">
                <span>Delivery Charge</span>
                <span>₹{DELIVERY_CHARGE}</span>
              </div>

              <hr className="my-3" />

              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>₹{getTotalAmount().toFixed(2)}</span>
              </div>

              <button
                onClick={placeOrder}
                disabled={placingOrder}
                className="mt-4 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:bg-green-300"
              >
                {placingOrder ? "Placing Order..." : "Place Order"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";

export default function Navbar({ cartCount }: { cartCount: number }) {
  return (
    <nav className="w-full bg-white shadow-md p-4 mb-6">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">PharmaTrade</h1>

        <div className="flex gap-6 items-center">
          {/* FIXED HOME ROUTE */}
          <Link to="/retailer" className="text-gray-700 hover:text-blue-600">
            Home
          </Link>

          <Link to="/cart" className="relative text-gray-700 hover:text-blue-600">
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                {cartCount}
              </span>
            )}
          </Link>

          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/";
            }}
            className="text-red-600 font-semibold hover:underline"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

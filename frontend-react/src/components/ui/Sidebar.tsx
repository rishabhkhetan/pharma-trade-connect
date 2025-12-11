import { useLocation } from "react-router-dom";
import NavItem from "./NavItem";

export default function Sidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="
      fixed left-0 top-0 h-screen w-64 
      backdrop-blur-xl bg-white/10 
      border-r border-cyan-400/40 dark:border-cyan-700/40
      p-6 flex flex-col justify-between
    ">
      {/* Top Section */}
      <div>
        <h1 className="text-2xl font-bold mb-10 
          bg-gradient-to-r from-violet-400 to-cyan-400 
          bg-clip-text text-transparent"
        >
          Hello, Pharma Admin <br /> (Name from API)
        </h1>

        <nav className="space-y-4">
          <NavItem
            to="/admin"
            label="Inventory"
            active={pathname === "/admin" || pathname.startsWith("/admin/")}
          />

          <NavItem
            to="/admin/orders"
            label="Orders"
            active={pathname.startsWith("/admin/orders")}
          />

          <NavItem
            to="/admin/requests"
            label="Requests"
            active={pathname.startsWith("/admin/requests")}
          />
        </nav>
      </div>

      {/* Logout Button */}
      <button
        onClick={() => {
          localStorage.clear();
          window.location.href = "/";
        }}
        className="
          mt-auto px-4 py-2 text-sm font-medium 
          text-gray-300 hover:text-white rounded-md 
          hover:bg-gradient-to-r hover:from-violet-500 hover:to-cyan-500 
          transition-all duration-300
        "
      >
        Logout
      </button>
    </aside>
  );
}

import { Link } from "react-router-dom";

interface NavItemProps {
  to: string;
  label: string;
  active: boolean;
}

export default function NavItem({ to, label, active }: NavItemProps) {
  return (
    <Link
      to={to}
      className={`
        block px-4 py-3 rounded-xl font-medium transition-all duration-300
        ${active
          ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-lg"
          : "text-gray-400 hover:text-white hover:bg-white/10"
        }
      `}
    >
      {label}
    </Link>
  );
}

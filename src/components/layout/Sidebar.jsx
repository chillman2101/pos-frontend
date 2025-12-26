import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Store,
  X,
} from "lucide-react";
import useAuthStore from "../../store/authStore";

const Sidebar = ({ isOpen = false, onClose }) => {
  const { user, logout } = useAuthStore();

  const menuItems = [
    {
      path: "/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
      roles: ["admin", "manager", "cashier"],
    },
    {
      path: "/transaction",
      icon: ShoppingCart,
      label: "Transaksi",
      roles: ["admin", "manager", "cashier"],
    },
    {
      path: "/products",
      icon: Package,
      label: "Produk",
      roles: ["admin", "manager", "cashier"],
    },
    {
      path: "/users",
      icon: Users,
      label: "Pengguna",
      roles: ["admin", "manager"],
    },
    {
      path: "/reports",
      icon: BarChart3,
      label: "Laporan",
      roles: ["admin", "manager"],
    },
    {
      path: "/settings",
      icon: Settings,
      label: "Pengaturan",
      roles: ["admin"],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(user?.role),
  );

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <div
      className={`h-screen w-64 bg-white border-r border-neutral-200 flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
    >
      {/* Logo */}
      <div className="h-16 border-b border-neutral-200 flex items-center px-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
            <Store className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-neutral-900">POS System</span>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-2 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-neutral-600" />
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin">
        <div className="space-y-1">
          {filteredMenuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg
                transition-all duration-200
                ${
                  isActive
                    ? "bg-primary-50 text-primary-700 font-medium shadow-sm"
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                }
              `}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* User Profile & Logout */}
      <div className="border-t border-neutral-200 p-4">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {user?.fullName?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-neutral-900 truncate">
              {user?.fullName || "User"}
            </p>
            <p className="text-xs text-neutral-500 capitalize">
              {user?.role || "cashier"}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-neutral-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

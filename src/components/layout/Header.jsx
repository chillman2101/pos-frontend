import React from "react";
import { Bell, Wifi, WifiOff, Menu } from "lucide-react";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";

const Header = ({ title, onMenuClick }) => {
  const isOnline = useNetworkStatus();

  return (
    <header className="h-16 bg-white border-b border-neutral-200 fixed top-0 right-0 lg:left-64 left-0 z-10">
      <div className="h-full px-6 flex items-center justify-between">
        <div
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6 text-neutral-700" />
        </div>
        {/* Title */}
        <h1 className="text-2xl font-semibold text-neutral-900">{title}</h1>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Online/Offline Status */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
              isOnline
                ? "bg-success-50 text-success-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {isOnline ? (
              <>
                <Wifi className="w-4 h-4" />
                <span>Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4" />
                <span>Offline</span>
              </>
            )}
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

import React, { useState } from "react";
import { Bell, Wifi, WifiOff, Menu } from "lucide-react";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";
import { useNotifications } from "../../contexts/NotificationContext";
import NotificationPanel from "./NotificationPanel";

const Header = ({ title, onMenuClick }) => {
  const isOnline = useNetworkStatus();
  const { unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);

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
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </header>
  );
};

export default Header;

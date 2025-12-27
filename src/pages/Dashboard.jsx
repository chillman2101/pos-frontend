import React, { useState, useEffect } from "react";
import { MainLayout } from "../components/layout";
import { Card } from "../components/common";
import {
  DollarSign,
  ShoppingCart,
  Package,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  WifiOff,
} from "lucide-react";
import useAuthStore from "../store/authStore";
import dashboardApi from "../api/dashboardApi";
import { dbHelpers } from "../db";
import { useNetworkStatus } from "../hooks/useNetworkStatus";

const Dashboard = () => {
  const { user } = useAuthStore();
  const isOnline = useNetworkStatus();

  // State
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [isOfflineData, setIsOfflineData] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const loadCachedData = async () => {
    setIsOfflineData(true);

    const cachedStats = await dbHelpers.getCachedDashboardData('stats');
    const cachedTransactions = await dbHelpers.getCachedDashboardData('recentTransactions');
    const cachedLowStock = await dbHelpers.getCachedDashboardData('lowStock');

    if (cachedStats) setDashboardStats(cachedStats);
    if (cachedTransactions) setRecentTransactions(cachedTransactions);
    if (cachedLowStock) setLowStockProducts(cachedLowStock);
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setIsOfflineData(false);

      if (isOnline) {
        // Try to fetch from API
        try {
          const [statsRes, transactionsRes, lowStockRes] = await Promise.all([
            dashboardApi.getStats(),
            dashboardApi.getRecentTransactions(),
            dashboardApi.getLowStockProducts(),
          ]);

          if (statsRes.success) {
            setDashboardStats(statsRes.data);
            await dbHelpers.cacheDashboardData('stats', statsRes.data);
          }

          if (transactionsRes.success) {
            setRecentTransactions(transactionsRes.data || []);
            await dbHelpers.cacheDashboardData('recentTransactions', transactionsRes.data);
          }

          if (lowStockRes.success) {
            setLowStockProducts(lowStockRes.data || []);
            await dbHelpers.cacheDashboardData('lowStock', lowStockRes.data);
          }
        } catch (apiError) {
          console.error("API fetch failed, falling back to cache:", apiError);
          await loadCachedData();
        }
      } else {
        // Offline: load from cache
        await loadCachedData();
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      await loadCachedData();
    } finally {
      setLoading(false);
    }
  };

  // Format stats for display
  const stats = dashboardStats
    ? [
        {
          title: "Total Penjualan Hari Ini",
          value: `Rp ${dashboardStats.today_sales.toLocaleString("id-ID")}`,
          change: `${dashboardStats.sales_change >= 0 ? "+" : ""}${dashboardStats.sales_change.toFixed(1)}%`,
          isPositive: dashboardStats.sales_change >= 0,
          icon: DollarSign,
          bgColor: "bg-primary-100",
          iconColor: "text-primary-600",
        },
        {
          title: "Transaksi Hari Ini",
          value: dashboardStats.today_transactions.toString(),
          change: `${dashboardStats.transactions_change >= 0 ? "+" : ""}${dashboardStats.transactions_change.toFixed(1)}%`,
          isPositive: dashboardStats.transactions_change >= 0,
          icon: ShoppingCart,
          bgColor: "bg-secondary-100",
          iconColor: "text-secondary-600",
        },
        {
          title: "Produk Terjual",
          value: dashboardStats.today_products_sold.toString(),
          change: `${dashboardStats.products_sold_change >= 0 ? "+" : ""}${dashboardStats.products_sold_change.toFixed(1)}%`,
          isPositive: dashboardStats.products_sold_change >= 0,
          icon: Package,
          bgColor: "bg-success-100",
          iconColor: "text-success-600",
        },
        {
          title: "Rata-rata per Transaksi",
          value: `Rp ${dashboardStats.avg_per_transaction.toLocaleString("id-ID", { maximumFractionDigits: 0 })}`,
          change: `${dashboardStats.avg_change >= 0 ? "+" : ""}${dashboardStats.avg_change.toFixed(1)}%`,
          isPositive: dashboardStats.avg_change >= 0,
          icon: TrendingUp,
          bgColor: "bg-purple-100",
          iconColor: "text-purple-600",
        },
      ]
    : [];

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <MainLayout title="Dashboard">
        <div className="flex items-center justify-center h-96">
          <RefreshCw className="w-8 h-8 text-primary-600 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Dashboard">
      {/* Welcome Message */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">
            Selamat datang, {user?.full_name || "User"}! 👋
          </h2>
          <p className="text-neutral-600 mt-1">
            Berikut ringkasan bisnis Anda hari ini
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Offline Indicator */}
      {isOfflineData && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
          <div className="flex items-center gap-3">
            <WifiOff className="w-5 h-5 text-yellow-700" />
            <div>
              <p className="font-semibold text-yellow-700">
                Menampilkan Data Cached (Offline)
              </p>
              <p className="text-sm text-yellow-600 mt-0.5">
                Data mungkin tidak up-to-date. Koneksikan ke internet untuk data terbaru.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => (
          <Card
            key={index}
            padding={false}
            className="hover:shadow-lg transition-all"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}
                >
                  <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
                <div
                  className={`flex items-center gap-1 text-sm font-medium ${
                    stat.isPositive ? "text-success-600" : "text-red-600"
                  }`}
                >
                  {stat.isPositive ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  <span>{stat.change}</span>
                </div>
              </div>
              <p className="text-sm text-neutral-600 mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-neutral-900">
                {stat.value}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <Card
          title="Transaksi Terbaru"
          subtitle="Transaksi hari ini"
          className="lg:col-span-2"
        >
          <div className="space-y-4">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((trx) => (
                <div
                  key={trx.id}
                  className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-neutral-900">
                      {trx.customer_name || "Customer"}
                    </p>
                    <p className="text-sm text-neutral-600">
                      {trx.transaction_code} • {formatTime(trx.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-neutral-900">
                      Rp {trx.final_amount.toLocaleString("id-ID")}
                    </p>
                    <span
                      className={`inline-block text-xs px-2 py-1 rounded-full ${
                        trx.payment_status === "completed"
                          ? "bg-success-100 text-success-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {trx.payment_status === "completed" ? "Selesai" : "Pending"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-neutral-500">
                Belum ada transaksi hari ini
              </div>
            )}
          </div>
        </Card>

        {/* Low Stock Alert */}
        <Card title="Stok Menipis" subtitle="Perlu restock">
          <div className="space-y-3">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <p className="font-medium text-neutral-900 text-sm mb-1">
                    {product.name}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-red-700 font-medium">
                      Stok: {product.stock}
                    </span>
                    <span className="text-neutral-600">SKU: {product.sku}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-neutral-500">
                Semua produk stok aman
              </div>
            )}
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Dashboard;

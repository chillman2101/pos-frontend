import React from "react";
import { MainLayout } from "../components/layout";
import { Card } from "../components/common";
import {
  DollarSign,
  ShoppingCart,
  Package,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import useAuthStore from "../store/authStore";

const Dashboard = () => {
  const { user } = useAuthStore();

  // Mock data - will be replaced with real API calls
  const stats = [
    {
      title: "Total Penjualan Hari Ini",
      value: "Rp 2.450.000",
      change: "+12.5%",
      isPositive: true,
      icon: DollarSign,
      bgColor: "bg-primary-100",
      iconColor: "text-primary-600",
    },
    {
      title: "Transaksi Hari Ini",
      value: "48",
      change: "+8.2%",
      isPositive: true,
      icon: ShoppingCart,
      bgColor: "bg-secondary-100",
      iconColor: "text-secondary-600",
    },
    {
      title: "Produk Terjual",
      value: "156",
      change: "+15.3%",
      isPositive: true,
      icon: Package,
      bgColor: "bg-success-100",
      iconColor: "text-success-600",
    },
    {
      title: "Rata-rata per Transaksi",
      value: "Rp 51.042",
      change: "-2.4%",
      isPositive: false,
      icon: TrendingUp,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  const recentTransactions = [
    {
      id: "TRX-001",
      customer: "John Doe",
      amount: "Rp 125.000",
      time: "10:30",
      status: "completed",
    },
    {
      id: "TRX-002",
      customer: "Jane Smith",
      amount: "Rp 89.500",
      time: "10:45",
      status: "completed",
    },
    {
      id: "TRX-003",
      customer: "Bob Wilson",
      amount: "Rp 234.000",
      time: "11:15",
      status: "completed",
    },
    {
      id: "TRX-004",
      customer: "Alice Brown",
      amount: "Rp 67.500",
      time: "11:30",
      status: "pending",
    },
  ];

  const lowStockProducts = [
    { name: "Coca Cola 330ml", stock: 5, minStock: 20 },
    { name: "Indomie Goreng", stock: 12, minStock: 30 },
    { name: "Teh Botol Sosro", stock: 8, minStock: 25 },
  ];

  return (
    <MainLayout title="Dashboard">
      {/* Welcome Message */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-neutral-900">
          Selamat datang, {user?.full_name || "User"}! 👋
        </h2>
        <p className="text-neutral-600 mt-1">
          Berikut ringkasan bisnis Anda hari ini
        </p>
      </div>

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
            {recentTransactions.map((trx) => (
              <div
                key={trx.id}
                className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-neutral-900">{trx.customer}</p>
                  <p className="text-sm text-neutral-600">
                    {trx.id} • {trx.time}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-neutral-900">{trx.amount}</p>
                  <span
                    className={`inline-block text-xs px-2 py-1 rounded-full ${
                      trx.status === "completed"
                        ? "bg-success-100 text-success-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {trx.status === "completed" ? "Selesai" : "Pending"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Low Stock Alert */}
        <Card title="Stok Menipis" subtitle="Perlu restock">
          <div className="space-y-3">
            {lowStockProducts.map((product, index) => (
              <div
                key={index}
                className="p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="font-medium text-neutral-900 text-sm mb-1">
                  {product.name}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-red-700 font-medium">
                    Stok: {product.stock}
                  </span>
                  <span className="text-neutral-600">
                    Min: {product.minStock}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Dashboard;

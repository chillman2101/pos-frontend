import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/layout';
import { Card, Button } from '../components/common';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Package,
  Calendar,
  Download,
  CreditCard,
} from 'lucide-react';
import SummaryCard from '../components/reports/SummaryCard';
import TopProductsTable from '../components/reports/TopProductsTable';
import reportsApi from '../api/reportsApi';
import { useToast } from '../contexts/ToastContext';

const Reports = () => {
  const toast = useToast();

  // State
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [paymentMethodData, setPaymentMethodData] = useState([]);

  // Date range state
  const [dateRange, setDateRange] = useState('today');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Fetch reports data
  useEffect(() => {
    fetchReportsData();
  }, [dateRange, customStartDate, customEndDate]);

  const getDateRangeParams = () => {
    const today = new Date();
    const params = {};

    switch (dateRange) {
      case 'today':
        params.start_date = today.toISOString().split('T')[0];
        params.end_date = today.toISOString().split('T')[0];
        break;

      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - 7);
        params.start_date = weekStart.toISOString().split('T')[0];
        params.end_date = today.toISOString().split('T')[0];
        break;

      case 'month':
        const monthStart = new Date(today);
        monthStart.setDate(1);
        params.start_date = monthStart.toISOString().split('T')[0];
        params.end_date = today.toISOString().split('T')[0];
        break;

      case 'custom':
        if (customStartDate) params.start_date = customStartDate;
        if (customEndDate) params.end_date = customEndDate;
        break;

      default:
        // All time - no date params
        break;
    }

    return params;
  };

  const fetchReportsData = async () => {
    try {
      setLoading(true);

      const params = getDateRangeParams();

      // Fetch all reports data in parallel
      const [summaryRes, topProductsRes, paymentRes] = await Promise.all([
        reportsApi.getSalesSummary(params),
        reportsApi.getTopProducts({ ...params, limit: 10 }),
        reportsApi.getSalesByPaymentMethod(params),
      ]);

      if (summaryRes.success) {
        setSummary(summaryRes.data);
      }

      if (topProductsRes.success) {
        setTopProducts(topProductsRes.data || []);
      }

      if (paymentRes.success) {
        setPaymentMethodData(paymentRes.data || []);
      }

    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getDateRangeLabel = () => {
    switch (dateRange) {
      case 'today':
        return 'Today';
      case 'week':
        return 'Last 7 Days';
      case 'month':
        return 'This Month';
      case 'all':
        return 'All Time';
      case 'custom':
        return 'Custom Range';
      default:
        return '';
    }
  };

  return (
    <MainLayout title="Reports & Analytics">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <BarChart3 className="w-8 h-8" />
            Reports & Analytics
          </h2>
          <p className="text-neutral-600 mt-1">
            Track your sales performance and insights
          </p>
        </div>

        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Date Range Filter */}
      <Card className="mb-6">
        <div className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-neutral-600" />
              <span className="text-sm font-medium text-neutral-700">Period:</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setDateRange('today')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  dateRange === 'today'
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                Today
              </button>

              <button
                onClick={() => setDateRange('week')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  dateRange === 'week'
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                7 Days
              </button>

              <button
                onClick={() => setDateRange('month')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  dateRange === 'month'
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                This Month
              </button>

              <button
                onClick={() => setDateRange('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  dateRange === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                All Time
              </button>

              <button
                onClick={() => setDateRange('custom')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  dateRange === 'custom'
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                Custom
              </button>
            </div>

            {/* Custom Date Range Inputs */}
            {dateRange === 'custom' && (
              <div className="flex gap-2 items-center">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                />
                <span className="text-neutral-500">to</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                />
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading reports...</p>
          </div>
        </Card>
      )}

      {/* Reports Content */}
      {!loading && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <SummaryCard
              title="Total Revenue"
              value={formatCurrency(summary?.total_revenue || 0)}
              icon={DollarSign}
              color="success"
            />

            <SummaryCard
              title="Total Transactions"
              value={summary?.total_transactions || 0}
              icon={ShoppingCart}
              color="primary"
            />

            <SummaryCard
              title="Products Sold"
              value={summary?.total_products_sold || 0}
              icon={Package}
              color="info"
            />

            <SummaryCard
              title="Average Order Value"
              value={formatCurrency(summary?.average_order_value || 0)}
              icon={TrendingUp}
              color="warning"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Products */}
            <div className="lg:col-span-2">
              <Card>
                <div className="p-6 border-b border-neutral-200">
                  <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary-600" />
                    Top Selling Products
                  </h3>
                  <p className="text-sm text-neutral-600 mt-1">
                    Best performing products for {getDateRangeLabel()}
                  </p>
                </div>
                <div className="p-6">
                  <TopProductsTable products={topProducts} />
                </div>
              </Card>
            </div>

            {/* Sales by Payment Method */}
            <div>
              <Card>
                <div className="p-6 border-b border-neutral-200">
                  <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary-600" />
                    Payment Methods
                  </h3>
                  <p className="text-sm text-neutral-600 mt-1">
                    Sales breakdown by payment type
                  </p>
                </div>
                <div className="p-6">
                  {paymentMethodData.length === 0 ? (
                    <p className="text-center text-neutral-500 py-8">
                      No payment data available
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {paymentMethodData.map((method) => (
                        <div key={method.payment_method}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-neutral-700 capitalize">
                              {method.payment_method}
                            </span>
                            <span className="text-sm font-semibold text-neutral-900">
                              {formatCurrency(method.total_amount || 0)}
                            </span>
                          </div>
                          <div className="w-full bg-neutral-200 rounded-full h-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full transition-all"
                              style={{
                                width: `${method.percentage || 0}%`,
                              }}
                            ></div>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-neutral-500">
                              {method.transaction_count || 0} transactions
                            </span>
                            <span className="text-xs font-medium text-primary-600">
                              {method.percentage ? method.percentage.toFixed(1) : 0}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </>
      )}
    </MainLayout>
  );
};

export default Reports;

import React from 'react';
import { TrendingUp, Package } from 'lucide-react';

const TopProductsTable = ({ products }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('id-ID').format(num);
  };

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
        <p className="text-neutral-600">No sales data available</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-neutral-50 border-b border-neutral-200">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
              Rank
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
              Product
            </th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-700">
              Qty Sold
            </th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-700">
              Revenue
            </th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-700">
              Avg Price
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {products.map((product, index) => (
            <tr key={product.product_id || index} className="hover:bg-neutral-50">
              {/* Rank */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-neutral-400">
                    #{index + 1}
                  </span>
                  {index === 0 && (
                    <TrendingUp className="w-4 h-4 text-warning-500" />
                  )}
                </div>
              </td>

              {/* Product Name */}
              <td className="px-4 py-3">
                <p className="font-medium text-neutral-900">
                  {product.product_name}
                </p>
                {product.sku && (
                  <p className="text-sm text-neutral-500">{product.sku}</p>
                )}
              </td>

              {/* Quantity Sold */}
              <td className="px-4 py-3 text-right">
                <span className="font-semibold text-neutral-900">
                  {formatNumber(product.total_quantity || 0)}
                </span>
                <span className="text-sm text-neutral-500 ml-1">units</span>
              </td>

              {/* Revenue */}
              <td className="px-4 py-3 text-right">
                <span className="font-semibold text-success-700">
                  {formatCurrency(product.total_revenue || 0)}
                </span>
              </td>

              {/* Average Price */}
              <td className="px-4 py-3 text-right">
                <span className="text-neutral-700">
                  {formatCurrency(product.avg_price || product.product_price || 0)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TopProductsTable;

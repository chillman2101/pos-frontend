import React from 'react';
import { Receipt, Eye, Clock, CheckCircle } from 'lucide-react';
import { Button, Card } from '../common';

const TransactionList = ({
  transactions,
  loading,
  error,
  currentPage,
  totalPages,
  onPageChange,
  onViewDetails,
}) => {
  if (loading) {
    return (
      <Card>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading transactions...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">⚠️</div>
          <p className="text-red-600 font-semibold mb-2">
            Error loading transactions
          </p>
          <p className="text-neutral-600 text-sm">{error}</p>
        </div>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <Receipt className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-500">Belum ada transaksi</p>
          <p className="text-neutral-400 text-sm mt-1">
            Transaksi yang Anda buat akan muncul di sini
          </p>
        </div>
      </Card>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPaymentMethodBadge = (method) => {
    const badges = {
      cash: 'bg-green-100 text-green-700',
      card: 'bg-blue-100 text-blue-700',
      qris: 'bg-purple-100 text-purple-700',
    };

    return badges[method] || 'bg-gray-100 text-gray-700';
  };

  const getStatusBadge = (transaction) => {
    // Check if synced or pending
    if (transaction.synced === false) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
          <Clock className="w-3 h-3" />
          Pending
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-success-100 text-success-700">
        <CheckCircle className="w-3 h-3" />
        Completed
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-700">
                  No. Transaksi
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-700">
                  Tanggal
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-700">
                  Pelanggan
                </th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-neutral-700">
                  Items
                </th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-neutral-700">
                  Total
                </th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-neutral-700">
                  Pembayaran
                </th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-neutral-700">
                  Status
                </th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-neutral-700">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr
                  key={transaction.id || transaction.client_transaction_id}
                  className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                >
                  {/* Transaction Code */}
                  <td className="py-4 px-6">
                    <span className="font-medium text-neutral-900 text-sm">
                      {transaction.transaction_code || transaction.client_transaction_id?.substring(0, 16) + '...'}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="py-4 px-6">
                    <span className="text-neutral-600 text-sm">
                      {formatDate(transaction.created_at)}
                    </span>
                  </td>

                  {/* Customer */}
                  <td className="py-4 px-6">
                    <span className="text-neutral-600 text-sm">
                      {transaction.customer_name || '-'}
                    </span>
                  </td>

                  {/* Items Count */}
                  <td className="py-4 px-6 text-center">
                    <span className="text-neutral-600 text-sm">
                      {transaction.items?.length || 0} item{transaction.items?.length > 1 ? 's' : ''}
                    </span>
                  </td>

                  {/* Total Amount */}
                  <td className="py-4 px-6 text-right">
                    <span className="font-semibold text-neutral-900 text-sm">
                      Rp {(transaction.final_amount || transaction.total_amount || 0).toLocaleString('id-ID')}
                    </span>
                  </td>

                  {/* Payment Method */}
                  <td className="py-4 px-6 text-center">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium uppercase ${getPaymentMethodBadge(
                        transaction.payment_method
                      )}`}
                    >
                      {transaction.payment_method}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-6 text-center">
                    {getStatusBadge(transaction)}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetails(transaction)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Lihat
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-600">
            Halaman {currentPage} dari {totalPages}
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Sebelumnya
            </Button>

            {/* Page numbers */}
            <div className="flex gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => onPageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionList;

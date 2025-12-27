import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/layout';
import TransactionFilters from '../components/transaction-history/TransactionFilters';
import TransactionList from '../components/transaction-history/TransactionList';
import TransactionDetailModal from '../components/transaction-history/TransactionDetailModal';
import transactionApi from '../api/transactionApi';
import { dbHelpers } from '../db';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

const TransactionHistory = () => {
  const isOnline = useNetworkStatus();

  // Filters state
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    payment_method: '',
    search: '',
  });

  // Transactions state
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Detail modal state
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Fetch transactions
  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filters]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Prepare params
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        ...filters,
      };

      // Remove empty filters
      Object.keys(params).forEach((key) => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      // Try online first
      if (isOnline) {
        try {
          const response = await transactionApi.getTransactions(params);

          if (response.success && response.data) {
            setTransactions(response.data);
            setTotalPages(response.pagination?.total_pages || 1);
            return;
          }
        } catch (error) {
          console.error('Online fetch failed:', error);
          // Fall through to offline mode
        }
      }

      // Offline fallback
      const offlineResult = await dbHelpers.getTransactions({
        ...filters,
        page: currentPage,
        limit: itemsPerPage,
      });

      setTransactions(offlineResult.data);
      setTotalPages(offlineResult.total_pages || 1);

    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleClearFilters = () => {
    setFilters({
      start_date: '',
      end_date: '',
      payment_method: '',
      search: '',
    });
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedTransaction(null);
  };

  return (
    <MainLayout title="Riwayat Transaksi">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-neutral-900">
          Riwayat Transaksi
        </h2>
        <p className="text-neutral-600 mt-1">
          Lihat dan kelola semua transaksi yang telah dilakukan
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <TransactionFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />
      </div>

      {/* Transaction List */}
      <TransactionList
        transactions={transactions}
        loading={loading}
        error={error}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onViewDetails={handleViewDetails}
      />

      {/* Detail Modal */}
      <TransactionDetailModal
        transaction={selectedTransaction}
        isOpen={showDetailModal}
        onClose={handleCloseDetailModal}
      />
    </MainLayout>
  );
};

export default TransactionHistory;

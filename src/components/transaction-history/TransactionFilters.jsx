import React from 'react';
import { Search, Calendar, CreditCard, X } from 'lucide-react';
import { Input, Button } from '../common';

const TransactionFilters = ({ filters, onFilterChange, onClearFilters }) => {
  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const hasActiveFilters =
    filters.start_date ||
    filters.end_date ||
    filters.payment_method ||
    filters.search;

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Cari Transaksi
          </label>
          <Input
            type="text"
            placeholder="No. transaksi..."
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            icon={<Search className="w-4 h-4 text-neutral-400" />}
          />
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Dari Tanggal
          </label>
          <Input
            type="date"
            value={filters.start_date || ''}
            onChange={(e) => handleChange('start_date', e.target.value)}
            icon={<Calendar className="w-4 h-4 text-neutral-400" />}
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Sampai Tanggal
          </label>
          <Input
            type="date"
            value={filters.end_date || ''}
            onChange={(e) => handleChange('end_date', e.target.value)}
            icon={<Calendar className="w-4 h-4 text-neutral-400" />}
          />
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Metode Pembayaran
          </label>
          <div className="relative">
            <select
              value={filters.payment_method || ''}
              onChange={(e) => handleChange('payment_method', e.target.value)}
              className="w-full px-4 py-2.5 pl-10 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="">Semua</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="qris">QRIS</option>
            </select>
            <CreditCard className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <div className="mt-4 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
          >
            <X className="w-4 h-4 mr-2" />
            Hapus Filter
          </Button>
        </div>
      )}
    </div>
  );
};

export default TransactionFilters;

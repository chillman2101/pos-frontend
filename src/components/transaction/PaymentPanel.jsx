import React, { useState, useEffect } from 'react';
import { CreditCard, Banknote, Smartphone, QrCode, Percent } from 'lucide-react';
import { Button, Input } from '../common';

const PaymentPanel = ({
  subtotal,
  onComplete,
  onReset,
  isProcessing = false,
  disabled = false
}) => {
  // Discount state
  const [discountType, setDiscountType] = useState('percent'); // 'percent' or 'nominal'
  const [discountValue, setDiscountValue] = useState(0);

  // Tax state
  const [taxPercent, setTaxPercent] = useState(10);

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState('cash');

  // Amount paid (for cash)
  const [amountPaid, setAmountPaid] = useState(0);

  // Customer name (optional)
  const [customerName, setCustomerName] = useState('');

  // Notes (optional)
  const [notes, setNotes] = useState('');

  // Calculate discount amount
  const discountAmount =
    discountType === 'percent'
      ? (subtotal * discountValue) / 100
      : discountValue;

  // Calculate tax amount
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = (taxableAmount * taxPercent) / 100;

  // Calculate final amount
  const finalAmount = subtotal - discountAmount + taxAmount;

  // Calculate change
  const change = paymentMethod === 'cash' ? Math.max(0, amountPaid - finalAmount) : 0;

  // Validation
  const isValid =
    subtotal > 0 &&
    (paymentMethod !== 'cash' || amountPaid >= finalAmount);

  // Quick discount presets
  const quickDiscounts = [
    { label: '5%', type: 'percent', value: 5 },
    { label: '10%', type: 'percent', value: 10 },
    { label: '15%', type: 'percent', value: 15 },
    { label: '20%', type: 'percent', value: 20 },
  ];

  // Payment method options
  const paymentMethods = [
    { id: 'cash', label: 'Cash', icon: Banknote, apiValue: 'cash' },
    { id: 'debit', label: 'Debit Card', icon: CreditCard, apiValue: 'card' },
    { id: 'credit', label: 'Credit Card', icon: CreditCard, apiValue: 'card' },
    { id: 'ewallet', label: 'E-Wallet', icon: Smartphone, apiValue: 'qris' },
    { id: 'qris', label: 'QRIS', icon: QrCode, apiValue: 'qris' },
  ];

  // Auto-calculate amount paid for non-cash payments
  useEffect(() => {
    if (paymentMethod !== 'cash') {
      setAmountPaid(finalAmount);
    }
  }, [paymentMethod, finalAmount]);

  const handleComplete = () => {
    if (!isValid || disabled) return;

    // Get API payment method value
    const selectedMethod = paymentMethods.find(m => m.id === paymentMethod);

    onComplete({
      customer_name: customerName.trim() || undefined,
      discount_amount: Math.round(discountAmount),
      tax_amount: Math.round(taxAmount),
      payment_method: selectedMethod.apiValue,
      paid_amount: paymentMethod === 'cash' ? Math.round(amountPaid) : undefined,
      notes: notes.trim() || undefined,
    });
  };

  const handleReset = () => {
    setDiscountType('percent');
    setDiscountValue(0);
    setTaxPercent(10);
    setPaymentMethod('cash');
    setAmountPaid(0);
    setCustomerName('');
    setNotes('');
    onReset && onReset();
  };

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-6 space-y-6">
      {/* Customer Name (Optional) */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Nama Pelanggan (Opsional)
        </label>
        <Input
          type="text"
          placeholder="Masukkan nama pelanggan..."
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          disabled={disabled}
        />
      </div>

      {/* Calculation Section */}
      <div className="space-y-3 border-t border-neutral-200 pt-6">
        <h3 className="font-semibold text-neutral-900 mb-4">Perhitungan</h3>

        {/* Subtotal */}
        <div className="flex justify-between text-neutral-700">
          <span>Subtotal</span>
          <span className="font-medium">
            Rp {subtotal.toLocaleString('id-ID')}
          </span>
        </div>

        {/* Discount */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-neutral-700">Diskon</label>
            <button
              onClick={() => setDiscountType(discountType === 'percent' ? 'nominal' : 'percent')}
              className="text-xs bg-neutral-100 hover:bg-neutral-200 px-2 py-1 rounded transition-colors"
              disabled={disabled}
            >
              {discountType === 'percent' ? '% → Rp' : 'Rp → %'}
            </button>
          </div>

          <div className="flex gap-2">
            <Input
              type="number"
              value={discountValue}
              onChange={(e) => setDiscountValue(Math.max(0, parseFloat(e.target.value) || 0))}
              placeholder="0"
              disabled={disabled}
              icon={discountType === 'percent' ? <Percent className="w-4 h-4" /> : <span>Rp</span>}
            />
          </div>

          {/* Quick discount buttons */}
          <div className="flex gap-2">
            {quickDiscounts.map((preset) => (
              <button
                key={preset.label}
                onClick={() => {
                  setDiscountType(preset.type);
                  setDiscountValue(preset.value);
                }}
                className="flex-1 px-2 py-1 text-xs bg-neutral-100 hover:bg-primary-100 hover:text-primary-700 rounded transition-colors"
                disabled={disabled}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-sm text-red-600">
              <span>Diskon</span>
              <span>- Rp {discountAmount.toLocaleString('id-ID')}</span>
            </div>
          )}
        </div>

        {/* Tax */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">Pajak (%)</label>
          <Input
            type="number"
            value={taxPercent}
            onChange={(e) => setTaxPercent(Math.max(0, parseFloat(e.target.value) || 0))}
            placeholder="10"
            disabled={disabled}
            icon={<Percent className="w-4 h-4" />}
          />
          {taxAmount > 0 && (
            <div className="flex justify-between text-sm text-neutral-600">
              <span>Pajak</span>
              <span>+ Rp {taxAmount.toLocaleString('id-ID')}</span>
            </div>
          )}
        </div>

        {/* Total */}
        <div className="flex justify-between text-lg font-bold text-neutral-900 pt-3 border-t border-neutral-200">
          <span>TOTAL BAYAR</span>
          <span className="text-2xl text-primary-600">
            Rp {finalAmount.toLocaleString('id-ID')}
          </span>
        </div>
      </div>

      {/* Payment Method */}
      <div className="space-y-3 border-t border-neutral-200 pt-6">
        <label className="block text-sm font-medium text-neutral-700 mb-3">
          Metode Pembayaran
        </label>

        <div className="grid grid-cols-2 gap-2">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            return (
              <button
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                disabled={disabled}
                className={`p-3 rounded-lg border-2 transition-all flex items-center gap-2 ${
                  paymentMethod === method.id
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{method.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Amount Paid (Cash only) */}
      {paymentMethod === 'cash' && (
        <div className="space-y-3 border-t border-neutral-200 pt-6">
          <label className="block text-sm font-medium text-neutral-700">
            Uang Dibayar
          </label>
          <Input
            type="number"
            value={amountPaid}
            onChange={(e) => setAmountPaid(Math.max(0, parseFloat(e.target.value) || 0))}
            placeholder="Masukkan jumlah uang..."
            disabled={disabled}
          />

          {/* Quick amount buttons */}
          <div className="grid grid-cols-4 gap-2">
            {[finalAmount, 50000, 100000, 200000].map((amount) => (
              <button
                key={amount}
                onClick={() => setAmountPaid(amount)}
                className="px-2 py-1.5 text-xs bg-neutral-100 hover:bg-primary-100 hover:text-primary-700 rounded transition-colors"
                disabled={disabled}
              >
                {amount === finalAmount ? 'Pas' : `${(amount / 1000)}k`}
              </button>
            ))}
          </div>

          {/* Change */}
          {amountPaid > 0 && (
            <div className="flex justify-between text-lg font-semibold pt-3 border-t border-neutral-200">
              <span className="text-neutral-700">Kembalian</span>
              <span className={change >= 0 ? 'text-success-600' : 'text-red-600'}>
                Rp {change.toLocaleString('id-ID')}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Notes (Optional) */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Catatan (Opsional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Tambahkan catatan transaksi..."
          disabled={disabled}
          rows="2"
          className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          fullWidth
          onClick={handleReset}
          disabled={disabled || isProcessing}
        >
          Reset
        </Button>
        <Button
          variant="primary"
          fullWidth
          onClick={handleComplete}
          disabled={!isValid || disabled || isProcessing}
          loading={isProcessing}
        >
          {isProcessing ? 'Memproses...' : 'Selesaikan Transaksi'}
        </Button>
      </div>

      {/* Validation message */}
      {!isValid && subtotal > 0 && paymentMethod === 'cash' && (
        <p className="text-sm text-red-600 text-center">
          Uang dibayar harus lebih dari atau sama dengan total bayar
        </p>
      )}
    </div>
  );
};

export default PaymentPanel;

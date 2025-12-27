import React, { useState } from 'react';
import { MainLayout } from '../components/layout';
import { WifiOff, RefreshCw } from 'lucide-react';
import ProductSelector from '../components/transaction/ProductSelector';
import Cart from '../components/transaction/Cart';
import PaymentPanel from '../components/transaction/PaymentPanel';
import ReceiptModal from '../components/transaction/ReceiptModal';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useTransactionSync } from '../hooks/useTransactionSync';
import transactionApi from '../api/transactionApi';
import { dbHelpers } from '../db';
import { useToast } from '../contexts/ToastContext';
import { useNotifications } from '../contexts/NotificationContext';
import useAuthStore from '../store/authStore';

const Transaction = () => {
  const toast = useToast();
  const { addNotification } = useNotifications();
  const { user } = useAuthStore();
  const isOnline = useNetworkStatus();
  const { pendingCount, triggerSync, isSyncing } = useTransactionSync();

  // Cart state
  const [cart, setCart] = useState([]);

  // Receipt modal state
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);
  const [isPendingTransaction, setIsPendingTransaction] = useState(false);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate subtotal
  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  /**
   * Add product to cart
   */
  const handleAddToCart = async (product) => {
    try {
      // Check local stock (from IndexedDB)
      const localProduct = await dbHelpers.getProductById(product.id);
      const currentStock = localProduct ? localProduct.stock : product.stock;

      const existingItem = cart.find((item) => item.product.id === product.id);

      if (existingItem) {
        // Increment quantity if already in cart
        if (existingItem.quantity < currentStock) {
          handleUpdateQuantity(product.id, existingItem.quantity + 1);
          toast.success(`${product.name} ditambahkan`);
        } else {
          toast.warning(`Stock ${product.name} tidak mencukupi (tersedia: ${currentStock})`);
        }
      } else {
        // Check if there's stock available
        if (currentStock > 0) {
          // Add new item to cart with updated stock info
          setCart([...cart, { product: { ...product, stock: currentStock }, quantity: 1 }]);
          toast.success(`${product.name} ditambahkan ke keranjang`);
        } else {
          toast.warning(`Stock ${product.name} habis`);
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Gagal menambahkan produk: ' + error.message);
    }
  };

  /**
   * Update item quantity
   */
  const handleUpdateQuantity = (productId, newQuantity) => {
    setCart(
      cart.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  /**
   * Remove item from cart
   */
  const handleRemoveItem = (productId) => {
    const item = cart.find((i) => i.product.id === productId);
    setCart(cart.filter((i) => i.product.id !== productId));
    toast.info(`${item.product.name} dihapus dari keranjang`);
  };

  /**
   * Clear entire cart
   */
  const handleClearCart = () => {
    if (window.confirm('Kosongkan keranjang?')) {
      setCart([]);
      toast.info('Keranjang dikosongkan');
    }
  };

  /**
   * Generate unique client transaction ID
   */
  const generateClientTransactionId = () => {
    const userId = user?.id || 'guest';
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `${userId}_${timestamp}_${random}`;
  };

  /**
   * Complete transaction
   */
  const handleCompleteTransaction = async (paymentData) => {
    if (cart.length === 0) {
      toast.warning('Keranjang masih kosong');
      return;
    }

    try {
      setIsProcessing(true);

      // Validate stock availability (check local IndexedDB)
      for (const item of cart) {
        const localProduct = await dbHelpers.getProductById(item.product.id);

        if (!localProduct) {
          throw new Error(`Produk ${item.product.name} tidak ditemukan di database lokal`);
        }

        if (localProduct.stock < item.quantity) {
          throw new Error(
            `Stock ${item.product.name} tidak mencukupi. Tersedia: ${localProduct.stock}, Diminta: ${item.quantity}`
          );
        }
      }

      // Prepare transaction data
      const transactionData = {
        client_transaction_id: generateClientTransactionId(),
        items: cart.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
          product_name: item.product.name, // For offline storage
        })),
        total_amount: subtotal,
        discount_amount: paymentData.discount_amount || 0,
        tax_amount: paymentData.tax_amount || 0,
        final_amount:
          subtotal -
          (paymentData.discount_amount || 0) +
          (paymentData.tax_amount || 0),
        payment_method: paymentData.payment_method,
        paid_amount: paymentData.paid_amount,
        customer_name: paymentData.customer_name,
        notes: paymentData.notes,
      };

      // Try online transaction first
      if (isOnline) {
        try {
          const response = await transactionApi.createTransaction(
            transactionData
          );

          if (response.success && response.data) {
            // Success!
            setLastTransaction(response.data);
            setIsPendingTransaction(false);
            setShowReceipt(true);
            setCart([]);

            toast.success('Transaksi berhasil!');

            // Add notification
            addNotification({
              type: 'success',
              title: 'Transaksi Berhasil',
              message: `${response.data.transaction_code} - Rp ${transactionData.final_amount.toLocaleString(
                'id-ID'
              )}`,
            });

            // Show warnings if any
            if (response.data.warnings && response.data.warnings.length > 0) {
              response.data.warnings.forEach((warning) => {
                addNotification({
                  type: 'warning',
                  title: 'Peringatan Stock',
                  message: warning.message,
                });
              });
            }

            return;
          }
        } catch (error) {
          console.error('Online transaction failed:', error);
          // Fall through to offline mode
        }
      }

      // Offline mode: save to IndexedDB
      console.log('💾 Saving transaction offline...');

      // Update local stock first
      try {
        const stockUpdates = await dbHelpers.bulkUpdateStock(
          transactionData.items,
          'subtract'
        );

        // Save transaction with stock update info (for rollback if sync fails)
        await dbHelpers.saveTransaction(transactionData, transactionData.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        })));

        console.log('📦 Local stock updated:', stockUpdates);

        setLastTransaction(transactionData);
        setIsPendingTransaction(true);
        setShowReceipt(true);
        setCart([]);

        toast.warning('Transaksi disimpan offline, stock dikurangi lokal');

        addNotification({
          type: 'info',
          title: 'Transaksi Offline',
          message: `Transaksi disimpan, stock dikurangi lokal, akan di-sync saat online`,
        });

      } catch (stockError) {
        // If stock update fails, don't save the transaction
        throw new Error(`Stock tidak mencukupi: ${stockError.message}`);
      }

    } catch (error) {
      console.error('Transaction error:', error);
      toast.error('Gagal menyimpan transaksi: ' + error.message);

      addNotification({
        type: 'error',
        title: 'Transaksi Gagal',
        message: error.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Handle manual sync
   */
  const handleSync = async () => {
    const result = await triggerSync();

    if (result.success) {
      toast.success(result.message);
      addNotification({
        type: 'success',
        title: 'Sync Berhasil',
        message: result.message,
      });
    } else {
      toast.error(result.message);
    }
  };

  return (
    <MainLayout title="Transaksi / POS">
      {/* Offline Mode Indicator */}
      {!isOnline && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
          <div className="flex items-center gap-3">
            <WifiOff className="w-5 h-5 text-yellow-700" />
            <div className="flex-1">
              <p className="font-semibold text-yellow-700">Mode Offline</p>
              <p className="text-sm text-yellow-600 mt-0.5">
                Transaksi akan disimpan secara lokal dan di-sync saat online
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pending Sync Indicator */}
      {pendingCount > 0 && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <RefreshCw className="w-5 h-5 text-blue-700 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-blue-700">
                {pendingCount} transaksi menunggu sync
              </p>
              <p className="text-sm text-blue-600 mt-0.5">
                {isOnline ? 'Klik tombol sync untuk mengirim ke server' : 'Akan di-sync otomatis saat online'}
              </p>
            </div>
            <button
              onClick={handleSync}
              disabled={!isOnline || isSyncing}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <RefreshCw
                className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`}
              />
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>
        </div>
      )}

      {/* Main Content - 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column: Product Selector */}
        <div className="lg:col-span-3">
          <ProductSelector onAddToCart={handleAddToCart} />
        </div>

        {/* Right Column: Cart + Payment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cart */}
          <Cart
            items={cart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
          />

          {/* Payment Panel */}
          <PaymentPanel
            subtotal={subtotal}
            onComplete={handleCompleteTransaction}
            onReset={handleClearCart}
            isProcessing={isProcessing}
            disabled={cart.length === 0}
          />
        </div>
      </div>

      {/* Receipt Modal */}
      <ReceiptModal
        transaction={lastTransaction}
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
        isPending={isPendingTransaction}
      />
    </MainLayout>
  );
};

export default Transaction;

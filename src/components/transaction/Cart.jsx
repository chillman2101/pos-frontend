import React from 'react';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '../common';
import CartItem from './CartItem';

const Cart = ({ items, onUpdateQuantity, onRemoveItem, onClearCart }) => {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 p-8">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-500 font-medium">Keranjang kosong</p>
          <p className="text-neutral-400 text-sm mt-1">
            Cari dan tambahkan produk untuk memulai transaksi
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-neutral-200">
      {/* Header */}
      <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-primary-600" />
          <h3 className="font-semibold text-neutral-900">
            Keranjang ({itemCount} item)
          </h3>
        </div>

        <button
          onClick={onClearCart}
          className="text-red-600 hover:bg-red-50 px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1.5"
        >
          <Trash2 className="w-4 h-4" />
          Kosongkan
        </button>
      </div>

      {/* Cart Items */}
      <div className="max-h-[400px] overflow-y-auto">
        {items.map((item) => (
          <CartItem
            key={item.product.id}
            item={item}
            onUpdateQuantity={onUpdateQuantity}
            onRemove={onRemoveItem}
          />
        ))}
      </div>

      {/* Summary */}
      <div className="p-4 border-t border-neutral-200 bg-neutral-50">
        <div className="flex items-center justify-between">
          <span className="text-neutral-700 font-medium">Subtotal</span>
          <span className="text-xl font-bold text-neutral-900">
            Rp {subtotal.toLocaleString('id-ID')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Cart;

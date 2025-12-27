import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const { product, quantity } = item;
  const subtotal = product.price * quantity;

  const handleIncrement = () => {
    if (quantity < product.stock) {
      onUpdateQuantity(product.id, quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      onUpdateQuantity(product.id, quantity - 1);
    }
  };

  const handleQuantityInput = (e) => {
    const value = parseInt(e.target.value) || 1;
    const newQuantity = Math.min(Math.max(1, value), product.stock);
    onUpdateQuantity(product.id, newQuantity);
  };

  return (
    <div className="flex items-center gap-3 p-3 border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors">
      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-neutral-900 text-sm truncate">
          {product.name}
        </h4>
        <p className="text-xs text-neutral-500 mt-0.5">
          Rp {product.price?.toLocaleString('id-ID')} × {quantity}
        </p>
        {quantity === product.stock && (
          <p className="text-xs text-yellow-600 mt-0.5">
            Max stock: {product.stock}
          </p>
        )}
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleDecrement}
          disabled={quantity <= 1}
          className="p-1 rounded hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Minus className="w-4 h-4 text-neutral-700" />
        </button>

        <input
          type="number"
          value={quantity}
          onChange={handleQuantityInput}
          min="1"
          max={product.stock}
          className="w-12 text-center border border-neutral-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />

        <button
          onClick={handleIncrement}
          disabled={quantity >= product.stock}
          className="p-1 rounded hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="w-4 h-4 text-neutral-700" />
        </button>
      </div>

      {/* Subtotal */}
      <div className="text-right min-w-[80px]">
        <p className="font-semibold text-neutral-900 text-sm">
          Rp {subtotal.toLocaleString('id-ID')}
        </p>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => onRemove(product.id)}
        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
        title="Hapus item"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export default CartItem;

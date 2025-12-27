import React, { useState, useEffect } from 'react';
import { Search, Plus, Package } from 'lucide-react';
import { Button, Input } from '../common';
import productApi from '../../api/productApi';
import { dbHelpers } from '../../db';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

const ProductSelector = ({ onAddToCart }) => {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const isOnline = useNetworkStatus();

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        searchProducts(query);
      } else {
        setProducts([]);
        setSearched(false);
      }
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const searchProducts = async (searchQuery) => {
    try {
      setLoading(true);
      setSearched(true);

      // Try online first
      if (isOnline) {
        try {
          const response = await productApi.getProducts({
            search: searchQuery,
            limit: 20,
            is_active: true
          });

          if (response.success && response.data) {
            setProducts(response.data);
            return;
          }
        } catch (error) {
          console.log('Online search failed, falling back to offline');
        }
      }

      // Offline fallback
      const offlineResult = await dbHelpers.getProducts({
        search: searchQuery,
        limit: 20
      });
      setProducts(offlineResult.data.filter(p => p.is_active));

    } catch (error) {
      console.error('Product search error:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = (product) => {
    if (product.stock <= 0) {
      return; // Don't add out-of-stock products
    }

    onAddToCart(product);

    // Optional: Clear search after adding
    // setQuery('');
    // setProducts([]);
    // setSearched(false);
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Input
          type="text"
          placeholder="Cari produk (nama atau SKU)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          icon={<Search className="w-5 h-5 text-neutral-400" />}
          className="pr-10"
        />
      </div>

      {/* Search Results */}
      <div className="bg-white rounded-lg border border-neutral-200 max-h-[500px] overflow-y-auto">
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-3"></div>
            <p className="text-neutral-600 text-sm">Mencari produk...</p>
          </div>
        )}

        {!loading && !searched && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-500 text-sm">Ketik untuk mencari produk</p>
          </div>
        )}

        {!loading && searched && products.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-500 text-sm">Produk tidak ditemukan</p>
            <p className="text-neutral-400 text-xs mt-1">Coba kata kunci lain</p>
          </div>
        )}

        {!loading && products.length > 0 && (
          <div className="divide-y divide-neutral-100">
            {products.map((product) => (
              <div
                key={product.id}
                className="p-4 hover:bg-neutral-50 transition-colors flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-neutral-900 truncate">
                    {product.name}
                  </h4>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-sm text-neutral-600">
                      SKU: {product.sku}
                    </span>
                    <span className="text-sm font-semibold text-primary-600">
                      Rp {product.price?.toLocaleString('id-ID') || 0}
                    </span>
                  </div>
                  <div className="mt-1">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        product.stock > 10
                          ? 'bg-success-50 text-success-700'
                          : product.stock > 0
                          ? 'bg-yellow-50 text-yellow-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      Stock: {product.stock}
                    </span>
                  </div>
                </div>

                <div className="ml-4">
                  <Button
                    size="sm"
                    variant={product.stock > 0 ? 'primary' : 'outline'}
                    onClick={() => handleAddProduct(product)}
                    disabled={product.stock <= 0}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Tambah
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductSelector;

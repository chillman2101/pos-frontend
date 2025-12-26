import { Edit, Package, Trash2 } from "lucide-react";
import { Button } from "../common";

const ProductGrid = ({ products, onEdit, onDelete }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Stock indicator dengan warna
  const getStockIndicator = (stock, minStock) => {
    if (stock === 0) {
      return {
        color: "bg-red-500",
        label: "Out of Stock",
        textColor: "text-red-700",
      };
    } else if (stock <= minStock) {
      return {
        color: "bg-yellow-500",
        label: "Low Stock",
        textColor: "text-yellow-700",
      };
    } else {
      return {
        color: "bg-success-500",
        label: "In Stock",
        textColor: "text-success-700",
      };
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product) => {
        const stockInfo = getStockIndicator(product.stock, product.min_stock);
        return (
          <div
            key={product.id}
            className="bg-white border border-netural-200 rounded-x1 hover:shadow-lg transition-all duration-200 overflow-hidden group"
          >
            <div className="relative h-48 bg-neutral-100 overflow-hidden">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-16 h-16 text-neutral-300" />
                </div>
              )}

              {/* Stock Badge - Floating*/}
              <div
                className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold text-white ${stockInfo.color}`}
              >
                {stockInfo.label}
              </div>
            </div>
            {/* Product Info */}
            <div className="p-4">
              <p className="text-xs text-neutral-500 mb-1">
                {product.category_name || "Uncategorized"}
              </p>

              <h3 className="font-semibold text-neutral-900 mb-1 line-clamp-1">
                {product.name}
              </h3>

              <p className="text-sm text-neutral-600 mb-2">
                SKU: {product.sku}
              </p>

              {product.description && (
                <p className="text-sm text-neutral-600 mb-3 line-clamp-2">
                  {product.description}
                </p>
              )}

              {/* Price & Stock*/}
              <div className="flex items-center justify-between mb-3 pt-3 border-t border-neutral-200">
                <div>
                  <p className="text-xs text-neutral-500">Harga</p>
                  <p className="text-lg font-bold text-primary-600">
                    {formatCurrency(product.price)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-neutral-500">Stok</p>
                  <p className={`text-lg font-bold ${stockInfo.textColor}`}>
                    {product.stock}
                  </p>
                </div>
              </div>

              {/* Actions*/}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => onEdit(product)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  onClick={() => onDelete(product)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Empty State */}
      {products.length === 0 && (
        <div className="col-span-full text-center py-12">
          <Package className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
          <p className="text-neutral-600">Tidak ada produk</p>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;

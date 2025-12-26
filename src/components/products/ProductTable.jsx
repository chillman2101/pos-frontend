import { Edit, Trash2 } from "lucide-react";

const ProductTable = ({ products, onEdit, onDelete }) => {
  const getStockBadge = (stock, minStock) => {
    if (stock === 0) {
      return (
        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
          Out of Stock
        </span>
      );
    } else if (stock <= minStock) {
      return (
        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
          Low Stock
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 bg-success-100 text-success-700 text-xs rounded-full">
          In Stock
        </span>
      );
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-neutral-100 border-b border-neutral-200">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
              Image
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
              Product
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
              SKU
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
              Category
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
              Price
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
              Stock
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {products.map((product) => (
            <tr
              key={product.id}
              className="hover:bg-neutral-50 transition-colors"
            >
              <td className="px-4 py-3">
                <div className="w-12 h-12 bg-neutral-200 rounded-lg overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-400">
                      IMG
                    </div>
                  )}
                </div>
              </td>

              <td className="px-4 py-3">
                <p className="font-medium text-neutral-900">{product.name}</p>
                {product.description && (
                  <p className="text-sm text-neutral-600 truncate max-w-xs">
                    {product.description}
                  </p>
                )}
              </td>

              <td className="px-4 py-3 text-sm text-neutral-700">
                {product.sku}
              </td>

              {/* Category */}
              <td className="px-4 py-3 text-sm text-neutral-700">
                {product.category_name || "-"}
              </td>

              {/* Price */}
              <td className="px-4 py-3 text-sm font-semibold text-neutral-900">
                {formatCurrency(product.price)}
              </td>

              {/* Stock */}
              <td className="px-4 py-3">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">{product.stock}</span>
                  {getStockBadge(product.stock, product.min_stock)}
                </div>
              </td>

              {/* Actions */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(product)}
                    className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(product)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Empty State */}
      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-neutral-600">Tidak ada produk</p>
        </div>
      )}
    </div>
  );
};

export default ProductTable;

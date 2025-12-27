import React, { useEffect } from "react";
import { X } from "lucide-react";
import ProductForm from "./ProductForm";

const ProductModal = ({
  isOpen,
  onClose,
  product = null,
  categories = [],
  onSubmit,
  isLoading = false,
}) => {
  const isEditMode = !!product;

  // Close modal on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      // Prevent body scroll when modal open
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
            <div>
              <h2 className="text-xl font-bold text-neutral-900">
                {isEditMode ? "Edit Produk" : "Tambah Produk Baru"}
              </h2>
              <p className="text-sm text-neutral-600 mt-0.5">
                {isEditMode
                  ? "Update informasi produk"
                  : "Isi form untuk menambah produk baru"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
              disabled={isLoading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body - Form */}
          <div className="px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin">
            <ProductForm
              product={product}
              categories={categories}
              onSubmit={onSubmit}
              onCancel={onClose}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;

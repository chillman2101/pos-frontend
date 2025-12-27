import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Input, Button } from "../common";
// Validation Schema
const productSchema = yup
  .object({
    name: yup
      .string()
      .required("Nama produk wajib diisi")
      .min(3, "Nama minimal 3 karakter"),
    sku: yup
      .string()
      .required("SKU wajib diisi")
      .matches(/^[A-Z0-9-]+$/, "SKU hanya boleh huruf besar, angka, dan dash")
      .min(2, "SKU minimal 2 karakter"),
    category_id: yup.string().required("Kategori wajib dipilih"),
    price: yup
      .number()
      .required("Harga jual wajib diisi")
      .positive("Harga harus lebih dari 0")
      .typeError("Harga harus berupa angka"),
    cost: yup
      .number()
      .positive("Harga beli harus lebih dari 0")
      .typeError("Harga beli harus berupa angka")
      .nullable()
      .transform((value, originalValue) =>
        originalValue === "" ? null : value,
      ),
    stock: yup
      .number()
      .required("Stok wajib diisi")
      .min(0, "Stok tidak boleh negatif")
      .integer("Stok harus bilangan bulat")
      .typeError("Stok harus berupa angka"),
    min_stock: yup
      .number()
      .min(0, "Stok minimal tidak boleh negatif")
      .integer("Stok minimal harus bilangan bulat")
      .typeError("Stok minimal harus berupa angka")
      .nullable()
      .transform((value, originalValue) =>
        originalValue === "" ? null : value,
      ),
    description: yup.string(),
    image_url: yup
      .string()
      .url("URL gambar tidak valid")
      .nullable()
      .transform((value, originalValue) =>
        originalValue === "" ? null : value,
      ),
  })
  .required();

const ProductForm = ({
  product = null,
  categories = [],
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const isEditMode = !!product;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(productSchema),
    defaultValues: product || {
      name: "",
      sku: "",
      category_id: "",
      price: "",
      cost: "",
      stock: "",
      min_stock: "",
      description: "",
      image_url: "",
    },
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name || "",
        sku: product.sku || "",
        category_id: product.category_id || "",
        price: product.price || "",
        cost: product.cost || "",
        stock: product.stock || "",
        min_stock: product.min_stock || "",
        description: product.description || "",
        image_url: product.image_url || "",
      });
    }
  }, [product, reset]);

  const handleFormSubmit = (data) => {
    const formattedData = {
      ...data,
      price: parseFloat(data.price),
      cost: data.cost ? parseFloat(data.cost) : null,
      stock: parseInt(data.stock),
      min_stock: data.min_stock ? parseInt(data.min_stock) : 0,
    };
    onSubmit(formattedData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Product Name */}
      <Input
        label="Nama Produk *"
        placeholder="Contoh: Indomie Goreng"
        error={errors.name?.message}
        {...register("name")}
      />

      {/* SKU & Category Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="SKU *"
          placeholder="Contoh: IM-001"
          error={errors.sku?.message}
          disabled={isEditMode} // SKU tidak bisa diubah saat edit
          {...register("sku")}
        />

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            Kategori *
          </label>
          <select
            {...register("category_id")}
            className={`
                  w-full px-4 py-2.5 border rounded-lg
                  bg-white text-neutral-900
                  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                  transition-all duration-200
                  ${errors.category_id ? "border-red-500" : "border-neutral-300"}
                `}
          >
            <option value="">Pilih Kategori</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.category_id && (
            <p className="mt-1.5 text-sm text-red-600">
              {errors.category_id.message}
            </p>
          )}
        </div>
      </div>

      {/* Price & Cost Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Harga Jual *"
          type="number"
          placeholder="15000"
          error={errors.price?.message}
          {...register("price")}
        />

        <Input
          label="Harga Beli"
          type="number"
          placeholder="12000"
          error={errors.cost?.message}
          {...register("cost")}
        />
      </div>

      {/* Stock & Min Stock Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Stok *"
          type="number"
          placeholder="100"
          error={errors.stock?.message}
          {...register("stock")}
        />

        <Input
          label="Stok Minimal"
          type="number"
          placeholder="20"
          error={errors.min_stock?.message}
          {...register("min_stock")}
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
          Deskripsi
        </label>
        <textarea
          {...register("description")}
          placeholder="Deskripsi produk (opsional)"
          rows="3"
          className={`
                w-full px-4 py-2.5 border rounded-lg
                bg-white text-neutral-900
                placeholder:text-neutral-400
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                transition-all duration-200
                ${errors.description ? "border-red-500" : "border-neutral-300"}
              `}
        />
        {errors.description && (
          <p className="mt-1.5 text-sm text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Image URL */}
      <Input
        label="URL Gambar"
        type="url"
        placeholder="https://example.com/product-image.jpg"
        error={errors.image_url?.message}
        {...register("image_url")}
      />

      {/* Submit Buttons */}
      <div className="flex gap-3 pt-4 border-t border-neutral-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          fullWidth
          disabled={isLoading}
        >
          Batal
        </Button>
        <Button type="submit" variant="primary" fullWidth loading={isLoading}>
          {isEditMode ? "Update Produk" : "Tambah Produk"}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;

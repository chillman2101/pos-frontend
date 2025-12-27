import React, { useRef } from "react";
import { X, Download, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "../common";
import html2pdf from "html2pdf.js";
import useAuthStore from "../../store/authStore";

const ReceiptModal = ({ transaction, isOpen, onClose, isPending = false }) => {
  const receiptRef = useRef();
  const { user } = useAuthStore();

  if (!isOpen || !transaction) return null;

  const handleDownloadPDF = () => {
    const element = receiptRef.current;
    const opt = {
      margin: 10,
      filename: `receipt-${transaction.transaction_code || "draft"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a5", orientation: "portrait" },
    };

    html2pdf().set(opt).from(element).save();
  };

  const formatDate = (dateString) => {
    if (!dateString) return new Date().toLocaleString("id-ID");
    return new Date(dateString).toLocaleString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isPending ? (
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              ) : (
                <CheckCircle className="w-6 h-6 text-success-600" />
              )}
              <div>
                <h3 className="text-xl font-bold text-neutral-900">
                  {isPending ? "Transaksi Pending" : "Transaksi Berhasil!"}
                </h3>
                {isPending && (
                  <p className="text-sm text-yellow-600 mt-0.5">
                    Akan di-sync saat online
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-neutral-500" />
            </button>
          </div>

          {/* Receipt Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div
              ref={receiptRef}
              className="bg-white p-8 space-y-6"
              style={{ fontFamily: "monospace" }}
            >
              {/* Store Header */}
              <div className="text-center border-b border-dashed border-neutral-300 pb-4">
                <h1 className="text-2xl font-bold">TOKO POS</h1>
                <p className="text-sm text-neutral-600 mt-1">
                  Jl. Contoh No. 123, Jakarta
                </p>
                <p className="text-sm text-neutral-600">
                  Telp: (021) 1234-5678
                </p>
              </div>

              {/* Transaction Info */}
              <div className="space-y-2 text-sm border-b border-dashed border-neutral-300 pb-4">
                <div className="flex justify-between">
                  <span className="text-neutral-600">No. Transaksi:</span>
                  <span className="font-bold">
                    {transaction.transaction_code ||
                      transaction.client_transaction_id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Tanggal:</span>
                  <span>{formatDate(transaction.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Kasir:</span>
                  <span>{user?.name || user?.username || "-"}</span>
                </div>
                {transaction.customer_name && (
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Pelanggan:</span>
                    <span>{transaction.customer_name}</span>
                  </div>
                )}
              </div>

              {/* Items */}
              <div className="space-y-3">
                <h3 className="font-bold text-center mb-3">DAFTAR ITEM</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-300">
                      <th className="text-left pb-2">Item</th>
                      <th className="text-center pb-2">Qty</th>
                      <th className="text-right pb-2">Harga</th>
                      <th className="text-right pb-2">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {transaction.items?.map((item, index) => (
                      <tr key={index}>
                        <td className="py-2">
                          {item.product_name || item.name}
                        </td>
                        <td className="text-center py-2">{item.quantity}</td>
                        <td className="text-right py-2">
                          {(item.product_price || item.price)?.toLocaleString(
                            "id-ID",
                          )}
                        </td>
                        <td className="text-right py-2">
                          {(
                            (item.product_price || item.price) * item.quantity
                          ).toLocaleString("id-ID")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="space-y-2 text-sm border-t border-dashed border-neutral-300 pt-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>
                    Rp{" "}
                    {(
                      (transaction.total_amount || 0) +
                      (transaction.discount_amount || 0) -
                      (transaction.tax_amount || 0)
                    ).toLocaleString("id-ID")}
                  </span>
                </div>

                {transaction.discount_amount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Diskon:</span>
                    <span>
                      - Rp {transaction.discount_amount.toLocaleString("id-ID")}
                    </span>
                  </div>
                )}

                {transaction.tax_amount > 0 && (
                  <div className="flex justify-between">
                    <span>Pajak:</span>
                    <span>
                      + Rp {transaction.tax_amount.toLocaleString("id-ID")}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-lg font-bold border-t border-neutral-300 pt-2 mt-2">
                  <span>TOTAL:</span>
                  <span>
                    Rp{" "}
                    {(
                      transaction.final_amount ||
                      transaction.total_amount ||
                      0
                    ).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Payment Info */}
              <div className="space-y-2 text-sm border-t border-dashed border-neutral-300 pt-4">
                <div className="flex justify-between">
                  <span>Metode Pembayaran:</span>
                  <span className="font-semibold uppercase">
                    {transaction.payment_method}
                  </span>
                </div>

                {transaction.payment_method === "cash" &&
                  transaction.paid_amount && (
                    <>
                      <div className="flex justify-between">
                        <span>Uang Dibayar:</span>
                        <span>
                          Rp {transaction.paid_amount.toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Kembalian:</span>
                        <span>
                          Rp{" "}
                          {(
                            transaction.paid_amount -
                            (transaction.final_amount ||
                              transaction.total_amount ||
                              0)
                          ).toLocaleString("id-ID")}
                        </span>
                      </div>
                    </>
                  )}
              </div>

              {/* Notes */}
              {transaction.notes && (
                <div className="text-sm border-t border-dashed border-neutral-300 pt-4">
                  <span className="text-neutral-600">Catatan:</span>
                  <p className="mt-1">{transaction.notes}</p>
                </div>
              )}

              {/* Footer */}
              <div className="text-center text-sm text-neutral-600 border-t border-dashed border-neutral-300 pt-4">
                <p>Terima kasih atas kunjungan Anda!</p>
                <p className="mt-1">
                  Barang yang sudah dibeli tidak dapat ditukar
                </p>
                <p className="mt-4 text-xs">Powered by POS System</p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-neutral-200 flex gap-3">
            <Button variant="outline" fullWidth onClick={onClose}>
              Tutup
            </Button>
            <Button variant="primary" fullWidth onClick={handleDownloadPDF}>
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReceiptModal;

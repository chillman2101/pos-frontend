import Dexie from "dexie";

export const db = new Dexie("POSDatabase");

db.version(1).stores({
  // Offline transactions (belum sync)
  transactions: "++id, clientTransactionId, createdAt, synced",

  // Cache data dari server
  products: "id, sku, categoryId, isActive",
  categories: "id, name",
  users: "id, username",

  // Queue untuk sync
  syncQueue: "++id, type, data, createdAt, retryCount",
});

export default db;

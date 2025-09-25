import { useEffect, useState } from "react";
import { openDB } from "./db";
import { ensureMediaFolder, saveImageAsync, deleteIfExists } from "../utils/media";

let dbPromise = null; // singleton promise for DB
// export const MEDIA_FOLDER = FileSystem.documentDirectory + "SQLite/";


export function useCustomers() {
  const [db, setDb] = useState(null);
  const [customers, setCustomers] = useState([]);

  // Initialize DB and media folder
  useEffect(() => {
    (async () => {
      await initDB();
    })();
  }, []);


  const initDB = async () => {
    if (db) return db;
    if (dbPromise) return dbPromise;
  
    dbPromise = (async () => {
      try {
        const database = await openDB();
        setDb(database);
        await ensureMediaFolder();
        return database;
      } catch (err) {
        console.error("DB init failed:", err);
        dbPromise = null; // allow retry
        throw err;
      }
    })();
  
    return dbPromise;
  };

  const loadCustomers = async () => {
    try {
      const database = await initDB();
      if (!database) return;

      // Fetch all customers
      const customerRows = await database.getAllAsync("SELECT * FROM customers ORDER By name ");

      // Fetch all images
      const imageRows = await database.getAllAsync("SELECT * FROM customer_images");

      // Group images by customerId
      const imagesByCustomer = {};
      for (const img of imageRows) {
        if (!imagesByCustomer[img.customerId]) {
          imagesByCustomer[img.customerId] = [];
        }
        imagesByCustomer[img.customerId].push({
          id: img.id,
          path: img.imagePath,
          date: img.date,
        });
      }

      // Merge customers with their images
      const mapped = customerRows.map((c) => ({
        ...c,
        images: imagesByCustomer[c.id] || [],
      }));

      setCustomers(mapped);
    } catch (err) {
      console.error("Error loading customers:", err);
    }
  };

  const addCustomer = async ({ name, phone, images = [] }) => {
    try {
      const database = db || (await initDB());
      if (!database) return;
      const now = new Date().toISOString();

      // Insert customer
      await database.runAsync(
        "INSERT INTO customers (name, phone, created_at, updated_at) VALUES (?, ?, ?, ?)",
        [name, phone,now,now]
      );


      // Get new customer id
      const { id: customerId } = await database.getFirstAsync(
        "SELECT last_insert_rowid() as id"
      );

      // Save each image
      for (const img of images) {
        const path = await saveImageAsync(img.uri || img);
        const date = img.date || new Date().toISOString();
        await database.runAsync(
          "INSERT INTO customer_images (customerId, imagePath, date) VALUES (?, ?, ?)",
          [customerId, path, date]
        );
      }

      await loadCustomers();
    } catch (err) {
      console.error("Error adding customer:", err);
    }
  };

  const updateCustomer = async ({ id, name, phone, images = [] }) => {
    try {
      const database = db || (await initDB());
      if (!database) return;
      const now = new Date().toISOString();


      // Update customer fields
      await database.runAsync(
        "UPDATE customers SET name = ?, phone = ?, updated_at = ? WHERE id = ?",
        [name, phone,now,id]
      );

      // Get existing images for this customer
      const existingImages = await database.getAllAsync(
        "SELECT * FROM customer_images WHERE customerId = ?",
        [id]
      );
      const existingMap = new Map(
        existingImages.map((img) => [img.imagePath, img]) // quick lookup
      );
      // Add only new images
      const newPaths = [];

      for (const img of images) {
        const path = img.uri || img.imagePath || img; // normalize path
        const date = img.date
          ? new Date(img.date).toISOString()
          : new Date().toISOString();
  
        if (existingMap.has(path)) {
          // 🔄 Update date if changed
          const oldImg = existingMap.get(path);
          if (oldImg.date !== date) {
            await database.runAsync(
              "UPDATE customer_images SET date = ? WHERE id = ?",
              [date, oldImg.id]
            );
          }
        } else {
          // 🆕 Save new image
          const savedPath = await saveImageAsync(path);
          await database.runAsync(
            "INSERT INTO customer_images (customerId, imagePath, date) VALUES (?, ?, ?)",
            [id, savedPath, date]
          );
        }
  
        newPaths.push(path);
      }
  
      // ❌ Delete removed images
      for (const oldImg of existingImages) {
        if (!newPaths.includes(oldImg.imagePath)) {
          await database.runAsync("DELETE FROM customer_images WHERE id = ?", [
            oldImg.id,
          ]);
          await deleteIfExists(oldImg.imagePath); // remove file too
        }
      }
  
      // ✅ Reload customers
      await loadCustomers();
    } catch (err) {
      console.error("Error updating customer:", err);
    }
  };

  const deleteCustomer = async (id) => {
    try {
      const database = db || (await initDB());
      if (!database) return;

      // Get all images first
      const images = await database.getAllAsync(
        "SELECT * FROM customer_images WHERE customerId = ?",
        [id]
      );

      // Delete customer (images will cascade if schema uses ON DELETE CASCADE)
      await database.runAsync("DELETE FROM customers WHERE id = ?", [id]);

      // Clean up image files
      for (const img of images) {
        await deleteIfExists(img.imagePath);
      }

      await loadCustomers();
    } catch (err) {
      console.error("Error deleting customer:", err);
    }
  };


  const getTotalCustomers = () => {
    return customers.length;
  };


  // In useCustomers.js
const getTotalImages = async () => {
  try {
    const database = db || (await initDB());
    if (!database) return 0;

    const result = await database.getFirstAsync(
      "SELECT COUNT(*) as total FROM customer_images"
    );

    return result.total || 0;
  } catch (err) {
    console.error("Error counting images:", err);
    return 0;
  }
};


  return {
    customers,
    addCustomer,
    deleteCustomer,
    reload: loadCustomers,
    updateCustomer,
    getTotalCustomers,
    getTotalImages
  };
}

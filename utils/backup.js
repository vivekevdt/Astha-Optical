import * as FileSystem from "expo-file-system/legacy";
import { zip, unzip } from "react-native-zip-archive";
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";

const DB_PATH = FileSystem.documentDirectory + "SQLite/customers.db";
const MEDIA_FOLDER = FileSystem.documentDirectory + "SQLite/";
const BACKUP_FOLDER = FileSystem.documentDirectory + "backup/";
const ZIP_PATH = BACKUP_FOLDER + "customers-backup.zip";

let abortController = new AbortController();

import { openDB } from "../database/db"; // your db helper

export async function exportBackup(onProgress) {
  try {
    try {
      const db = await openDB();
      await db.closeAsync();
    } catch (e) {
      console.log("No active DB connection to close:", e.message);
    }

    // Ensure backup folder exists
    const folderInfo = await FileSystem.getInfoAsync(BACKUP_FOLDER);
    if (!folderInfo.exists) {
      await FileSystem.makeDirectoryAsync(BACKUP_FOLDER, { intermediates: true });
    }

    // Clear previous backup
    const zipInfo = await FileSystem.getInfoAsync(ZIP_PATH);
    if (zipInfo.exists) {
      await FileSystem.deleteAsync(ZIP_PATH, { idempotent: true });
    }

    const filesToCopy = [];

    // Add DB
    const dbBackupPath = BACKUP_FOLDER + "customers.db";
    filesToCopy.push({ from: DB_PATH, to: dbBackupPath });

    // Add all media files
    const mediaFiles = await FileSystem.readDirectoryAsync(MEDIA_FOLDER);
    for (const file of mediaFiles) {
      filesToCopy.push({
        from: MEDIA_FOLDER + file,
        to: BACKUP_FOLDER + file,
      });
    }

    // Track progress
    let copied = 0;
    const total = filesToCopy.length;

    for (const f of filesToCopy) {
      if (abortController.signal.aborted) throw new Error("Backup cancelled");

      await FileSystem.copyAsync(f);
      copied++;

      if (onProgress) {
        const percent = Math.round((copied / total) * 100);
        onProgress(percent); // ✅ use callback, not setExportProgress here
      }
    }

    // Create zip
    if (abortController.signal.aborted) throw new Error("Backup cancelled");
    await zip(BACKUP_FOLDER, ZIP_PATH);

    if (abortController.signal.aborted) throw new Error("Backup cancelled");

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(ZIP_PATH);
    }

    return ZIP_PATH;
  } catch (error) {
    console.warn(error.message);
    return null;
  }
}


// Call this to cancel
export function cancelBackup() {
  abortController.abort();
}

export async function importBackup(onReload) {
  const result = await DocumentPicker.getDocumentAsync({
    type: "application/zip",
  });
  if (result.canceled) return;
  const pickedZip = result.assets[0].uri;
  await unzip(pickedZip, MEDIA_FOLDER);
  if (onReload) onReload();
}

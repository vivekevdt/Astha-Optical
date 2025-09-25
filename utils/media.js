// utils/media.js
import * as FileSystem from "expo-file-system";

/**
 * We keep images in the same "SQLite" directory you already use,
 * so your existing backup/restore continues to work unchanged.
 */
export const MEDIA_FOLDER = FileSystem.documentDirectory + "SQLite/";



/** Ensure the media folder exists (idempotent). */
export async function ensureMediaFolder() {
  const info = await FileSystem.getInfoAsync(MEDIA_FOLDER);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(MEDIA_FOLDER, { intermediates: true });
  }
  return MEDIA_FOLDER;
}

/** Join a filename to the media folder path. */
export function mediaPath(filename) {
  return MEDIA_FOLDER + filename;
}

/** Generate a unique filename, preserving (or defaulting) extension. */
export function uniqueName(ext = "jpeg") {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${Date.now()}_${rand}.${ext.replace(/^\./, "")}`;
}

/** Guess file extension from a URI (very basic). */
function guessExtFromUri(uri) {
  try {
    const q = uri.split("?")[0];
    const dot = q.lastIndexOf(".");
    if (dot !== -1) return q.slice(dot + 1).toLowerCase();
  } catch {}
  return "jpeg";
}

/**
 * Copy an image/file URI into the media folder and return the saved path.
 * - Ensures folder exists
 * - Generates a unique filename
 */
export async function saveImageAsync(srcUri) {
  await ensureMediaFolder();
  const ext = guessExtFromUri(srcUri);
  const filename = uniqueName(ext);
  const dest = mediaPath(filename);
  await FileSystem.copyAsync({ from: srcUri, to: dest });
  return dest; // absolute path inside app sandbox
}

/** Delete a file if it exists (safe/no-throw). */
export async function deleteIfExists(path) {
  if (!path) return;
  try {
    const info = await FileSystem.getInfoAsync((path));
    console.log(info)
    if (info.exists) {
      await FileSystem.deleteAsync((path), { idempotent: true });

    }
  } catch(e) {
    // swallow errors to keep UX smooth
    console.log(e)
  }
}

/** List files currently in the media folder. */
export async function listMedia() {
  await ensureMediaFolder();
  return FileSystem.readDirectoryAsync(MEDIA_FOLDER);
}

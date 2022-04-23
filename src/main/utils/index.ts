/* eslint import/prefer-default-export: off, import/no-mutable-exports: off */
import Store from 'electron-store';
import fs from 'fs/promises';
import path from 'path';
import { URL } from 'url';

const store = new Store({});

export let resolveHtmlPath: (htmlFileName: string) => string;

if (process.env.NODE_ENV === 'development') {
  const port = process.env.PORT || 1212;
  resolveHtmlPath = (htmlFileName: string) => {
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  };
} else {
  resolveHtmlPath = (htmlFileName: string) => {
    return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
  };
}

/**
 * @param {string} filepath
 * Path of the original file to encrypt.
 *
 * @returns {boolean} True if encryption was successful, false otherwise.
 *
 * @description
 *  - Stores MD5 hash of original file in store.
 *  - Writes the encrypted version of the specified file to disk.
 *  - Saves the encrypted version next to the file original
 */
export async function encryptFile(filepath: string) {
  const content = await fs.readFile(filepath, { encoding: 'binary' });
  const key = store.get('@KEY_BASE_PASSWORD', '');
  // Throw error or return false response?
  if (!key) throw new Error('Password not set');
}

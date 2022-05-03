/* eslint import/prefer-default-export: off, import/no-mutable-exports: off */
import crypto from 'crypto'
import Store from 'electron-store';
import fs from 'fs/promises';
import path from 'path';
import { URL } from 'url';

const ENCRYPTION_ALGO = 'aes-256-ctr'

const store = new Store({})

export let resolveHtmlPath: (htmlFileName: string) => string

if (process.env.NODE_ENV === 'development') {
  const port = process.env.PORT || 1212
  resolveHtmlPath = (htmlFileName: string) => {
    const url = new URL(`http://localhost:${port}`)
    url.pathname = htmlFileName
    return url.href
  }
} else {
  resolveHtmlPath = (htmlFileName: string) => {
    return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`
  }
}

/**
 * @param {string} filePath
 * Path of the original file to encrypt.
 *
 * @returns {boolean} True if encryption was successful, false otherwise.
 *
 * @description
 *  - Stores MD5 hash of original file in store.
 *  - Writes the encrypted version of the specified file to disk.
 *  - Saves the encrypted version next to the file original
 */
export async function encryptFile(filePath: string) {
  const content = await fs.readFile(filePath, { encoding: 'binary' })
  const password = store.get('@KEY_BASE_PASSWORD', 'ucrypt') as string

  // Throw error or return false response?
  if (!password) throw new Error('Password not set')

  const key = crypto
    .createHash('sha256')
    .update(password)
    .digest('base64')
    .substring(0, 32)
  const iv = crypto.randomBytes(16).toString('hex').slice(0, 16)
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGO, key, iv)
  const lockedFile =
    iv + cipher.update(content, 'binary', 'hex') + cipher.final('hex')

  const targetDir = path.dirname(filePath)
  const fileName = path.basename(filePath)
  await fs.writeFile(path.join(targetDir, `${fileName}.ucrypt`), lockedFile, {
    encoding: 'binary',
  })
}

/**
 * @param {string} filePath
 * Path of the original file to decrypt.
 *
 * @returns {boolean} True if decryption was successful, false otherwise.
 *
 * @description
 *  - Calculate MD5 hash of file.
 *  - Writes the decrypted version of the specified file to disk.
 *  - Compare MD5 hashes of file to its name in the app's database.
 */
export async function decryptFile(filePath: string) {
  const targetDir = path.dirname(filePath)
  const fileName = path.basename(filePath)

  // Abort if filename does not end with '.ucrypt'
  if (path.extname(fileName) !== '.ucrypt') throw new Error('Unsupported file')

  // Use a default password 'ucrypt' until the password flow is implemented
  const password = store.get('@KEY_BASE_PASSWORD', 'ucrypt') as string
  // [TODO] Throw error or return false response?
  if (!password) throw new Error('Password not set')

  const key = crypto
    .createHash('sha256')
    .update(password)
    .digest('base64')
    .substring(0, 32)
  let content = await fs.readFile(filePath, { encoding: 'binary' })
  const iv = content.slice(0, 16)
  content = content.slice(16)
  const decipher = crypto.createDecipheriv(ENCRYPTION_ALGO, key, iv)
  const unlockedFile =
    decipher.update(content, 'hex', 'binary') + decipher.final('binary')
  await fs.writeFile(
    path.join(targetDir, `${path.parse(fileName).name}`),
    unlockedFile,
    { encoding: 'binary' },
  )
}

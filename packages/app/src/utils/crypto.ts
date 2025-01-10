import CryptoJS from 'crypto-js';

/**
 * Generate a random encryption salt.
 * 
 * @return {string} A random encryption salt.
 */
export function generateEncryptionSalt() {
	return CryptoJS.lib.WordArray.random(128 / 8).toString();
}

/**
 * Derive a Key Encryption Key (KEK) from a password and salt.
 * 
 * @param {string} password The password.
 * @param {string} salt The salt.
 * 
 * @return {CryptoJS.lib.WordArray} The derived KEK.
 */
export function deriveKey(password: string, salt: string) {
  return CryptoJS.PBKDF2(password, salt, { keySize: 256 / 32, iterations: 1000 });
}

/**
 * Wrap (encrypt) a DEK using the KEK.
 * 
 * @param {string} DEK The Data Encryption Key.
 * @param {CryptoJS.lib.WordArray} KEK The Key Encryption Key.
 * 
 * @return {string} The wrapped DEK.
 */
export function wrapDEK(DEK: string, KEK: CryptoJS.lib.WordArray): string {
  return CryptoJS.AES.encrypt(DEK, KEK.toString()).toString();
}

/**
 * Unwrap (decrypt) a stored wrapped DEK using the KEK.
 */
export function unwrapDEK(wrappedDEK: string, KEK: CryptoJS.lib.WordArray): string {
  const bytes = CryptoJS.AES.decrypt(wrappedDEK, KEK.toString());
  return bytes.toString(CryptoJS.enc.Utf8);
}

/**
 * Deterministic encryption using a fixed IV (all zeros).
 * Suitable for fields that need to be queryable.
 * 
 * @param {string} key The encryption key.
 * @param {string} plaintext The plaintext to encrypt.
 * 
 * @return {string} The encrypted text.
 */
export function deterministicEncrypt(key: string, plaintext: string): string {
  const fixedIV = CryptoJS.enc.Hex.parse('00000000000000000000000000000000');
  const encrypted = CryptoJS.AES.encrypt(plaintext, key, { iv: fixedIV });
  return encrypted.toString();
}

/**
 * Random (probabilistic) encryption.
 * Suitable for sensitive fields where confidentiality is paramount.
 * 
 * @param {string} key The encryption key.
 * @param {string} plaintext The plaintext to encrypt.
 * 
 * @return {string} The encrypted text.
 */
export function randomEncrypt(key: string, plaintext: string): string {
  const encrypted = CryptoJS.AES.encrypt(plaintext, key);
  return encrypted.toString();
}

/**
 * Blind the wallet ID using HMAC-SHA256 to obfuscate the relationship.
 * 
 * @param {string} walletId The wallet ID.
 * @param {string} key The HMAC key.
 * 
 * @return {string} The blinded wallet ID.
 */
export function blindWalletId(walletId: string, key: string): string {
  const token = CryptoJS.HmacSHA256(walletId, key);
  return token.toString(CryptoJS.enc.Hex);
}

export function deterministicDecrypt(key: string, ciphertext: string) {
  const iv = CryptoJS.enc.Hex.parse("00000000000000000000000000000000");
  const decrypted = CryptoJS.AES.decrypt(ciphertext, key.toString(), { iv: iv });
  return decrypted.toString(CryptoJS.enc.Utf8);
}

export function randomDecrypt(key: string, ciphertext: string) {
  const decrypted = CryptoJS.AES.decrypt(ciphertext, key.toString());
  return decrypted.toString(CryptoJS.enc.Utf8);
}
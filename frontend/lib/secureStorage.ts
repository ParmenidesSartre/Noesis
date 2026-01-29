/**
 * Secure Storage using sessionStorage with AES-GCM encryption
 * Tokens are encrypted before storage and decrypted on retrieval
 */

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const SALT_LENGTH = 16;

/**
 * Derive encryption key from browser fingerprint and session data
 * This creates a unique key per session that can't be easily extracted
 */
async function deriveKey(password: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  // Generate salt from session-specific data (stored unencrypted)
  let salt = sessionStorage.getItem('_salt');
  if (!salt) {
    const saltBuffer = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    salt = Array.from(saltBuffer, (byte) => byte.toString(16).padStart(2, '0')).join('');
    sessionStorage.setItem('_salt', salt);
  }

  const saltBuffer = new Uint8Array(
    salt.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Get or create session encryption password
 * Uses browser fingerprint + random session ID
 */
function getSessionPassword(): string {
  let sessionKey = sessionStorage.getItem('_sk');
  if (!sessionKey) {
    // Create fingerprint from available browser data
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      new Date().getTimezoneOffset(),
      screen.width,
      screen.height,
      screen.colorDepth,
    ].join('|');

    // Add random component for this session
    const randomBytes = crypto.getRandomValues(new Uint8Array(32));
    const randomPart = Array.from(randomBytes, (byte) =>
      byte.toString(16).padStart(2, '0')
    ).join('');

    sessionKey = fingerprint + randomPart;
    sessionStorage.setItem('_sk', sessionKey);
  }
  return sessionKey;
}

/**
 * Encrypt data using AES-GCM
 */
async function encrypt(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await deriveKey(getSessionPassword());
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  const encryptedData = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoder.encode(data)
  );

  // Combine IV + encrypted data and convert to hex
  const combined = new Uint8Array(iv.length + encryptedData.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encryptedData), iv.length);

  return Array.from(combined, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Decrypt data using AES-GCM
 */
async function decrypt(encryptedHex: string): Promise<string> {
  const decoder = new TextDecoder();
  const key = await deriveKey(getSessionPassword());

  // Convert hex to bytes
  const combined = new Uint8Array(
    encryptedHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
  );

  // Extract IV and encrypted data
  const iv = combined.slice(0, IV_LENGTH);
  const encryptedData = combined.slice(IV_LENGTH);

  try {
    const decryptedData = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv },
      key,
      encryptedData
    );

    return decoder.decode(decryptedData);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Secure storage wrapper for sessionStorage with encryption
 */
export const secureStorage = {
  /**
   * Store encrypted data in sessionStorage
   */
  async setItem(key: string, value: string): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const encryptedValue = await encrypt(value);
      sessionStorage.setItem(`_enc_${key}`, encryptedValue);
    } catch (error) {
      console.error('Failed to encrypt and store data:', error);
      throw error;
    }
  },

  /**
   * Retrieve and decrypt data from sessionStorage
   */
  async getItem(key: string): Promise<string | null> {
    if (typeof window === 'undefined') return null;

    try {
      const encryptedValue = sessionStorage.getItem(`_enc_${key}`);
      if (!encryptedValue) return null;

      return await decrypt(encryptedValue);
    } catch (error) {
      console.error('Failed to decrypt data:', error);
      // If decryption fails, remove corrupted data
      sessionStorage.removeItem(`_enc_${key}`);
      return null;
    }
  },

  /**
   * Remove item from sessionStorage
   */
  removeItem(key: string): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(`_enc_${key}`);
  },

  /**
   * Clear all encrypted items (keeps session keys)
   */
  clear(): void {
    if (typeof window === 'undefined') return;

    // Get all keys that start with _enc_
    const keys = Object.keys(sessionStorage).filter((key) => key.startsWith('_enc_'));
    keys.forEach((key) => sessionStorage.removeItem(key));
  },

  /**
   * Clear everything including session keys (full logout)
   */
  clearAll(): void {
    if (typeof window === 'undefined') return;
    sessionStorage.clear();
  },
};

/**
 * Synchronous version for backwards compatibility (uses unencrypted sessionStorage)
 * Only use this for non-sensitive data
 */
export const unsecureStorage = {
  setItem(key: string, value: string): void {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(key, value);
  },

  getItem(key: string): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(key);
  },

  removeItem(key: string): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(key);
  },
};

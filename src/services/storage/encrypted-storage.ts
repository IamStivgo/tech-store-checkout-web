/** Key-value storage whose reads and writes may be asynchronous (e.g. encrypted). */
export interface AsyncStorage {
  getItem(name: string): Promise<string | null>;
  setItem(name: string, value: string): Promise<void>;
  removeItem(name: string): Promise<void>;
}

/** Where the encryption key lives between visits. */
export interface KeyStore {
  load(): Promise<CryptoKey | undefined>;
  save(key: CryptoKey): Promise<void>;
}

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const PREFIX = 'enc:v1:';

const toBase64 = (bytes: Uint8Array): string =>
  btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(''));

const fromBase64 = (text: string): Uint8Array<ArrayBuffer> =>
  Uint8Array.from(atob(text), (char) => char.charCodeAt(0));

/**
 * Encrypts every value with AES-GCM before it reaches `storage` (T-074). The key is created
 * non-extractable and kept in `keys`: a copy of the storage alone reveals nothing. A value that
 * cannot be decrypted (another key, tampered or saved before encryption) is dropped.
 */
export class EncryptedStorage implements AsyncStorage {
  private key: Promise<CryptoKey> | undefined;

  constructor(
    private readonly storage: Storage,
    private readonly keys: KeyStore,
    private readonly subtle: SubtleCrypto,
  ) {}

  async getItem(name: string): Promise<string | null> {
    const stored = this.storage.getItem(name);
    if (stored === null) {
      return null;
    }
    try {
      if (!stored.startsWith(PREFIX)) {
        throw new Error('Not encrypted');
      }
      const payload = fromBase64(stored.slice(PREFIX.length));
      const plaintext = await this.subtle.decrypt(
        { name: ALGORITHM, iv: payload.slice(0, IV_LENGTH) },
        await this.encryptionKey(),
        payload.slice(IV_LENGTH),
      );
      return new TextDecoder().decode(plaintext);
    } catch {
      this.storage.removeItem(name);
      return null;
    }
  }

  async setItem(name: string, value: string): Promise<void> {
    try {
      const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
      const ciphertext = new Uint8Array(
        await this.subtle.encrypt(
          { name: ALGORITHM, iv },
          await this.encryptionKey(),
          new TextEncoder().encode(value),
        ),
      );
      const payload = new Uint8Array(IV_LENGTH + ciphertext.length);
      payload.set(iv);
      payload.set(ciphertext, IV_LENGTH);
      this.storage.setItem(name, `${PREFIX}${toBase64(payload)}`);
    } catch {
      // Full or blocked storage (private mode): the checkout still works, it is only lost on reload.
    }
  }

  removeItem(name: string): Promise<void> {
    this.storage.removeItem(name);
    return Promise.resolve();
  }

  private encryptionKey(): Promise<CryptoKey> {
    this.key ??= this.keys.load().then(
      async (saved) =>
        saved ??
        this.subtle
          .generateKey({ name: ALGORITHM, length: KEY_LENGTH }, false, ['encrypt', 'decrypt'])
          .then(async (created) => {
            await this.keys.save(created);
            return created;
          }),
    );
    return this.key;
  }
}

const DATABASE = 'tech-store';
const OBJECT_STORE = 'keys';
const KEY_ID = 'checkout';

const openDatabase = (factory: IDBFactory): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = factory.open(DATABASE, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(OBJECT_STORE);
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      reject(request.error ?? new Error('IndexedDB is not available'));
    };
  });

const inStore = <T>(
  factory: IDBFactory,
  mode: IDBTransactionMode,
  work: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> =>
  openDatabase(factory).then(
    (database) =>
      new Promise<T>((resolve, reject) => {
        const request = work(database.transaction(OBJECT_STORE, mode).objectStore(OBJECT_STORE));
        request.onsuccess = () => {
          database.close();
          resolve(request.result);
        };
        request.onerror = () => {
          database.close();
          reject(request.error ?? new Error('IndexedDB request failed'));
        };
      }),
  );

/** IndexedDB keeps the CryptoKey object itself, so it never has to be exported. */
export const indexedDbKeyStore = (factory: IDBFactory): KeyStore => ({
  load: () =>
    inStore<CryptoKey | undefined>(
      factory,
      'readonly',
      (store) => store.get(KEY_ID) as IDBRequest<CryptoKey | undefined>,
    ),
  save: (key) =>
    inStore(factory, 'readwrite', (store) => store.put(key, KEY_ID)).then(() => undefined),
});

/** Nothing is kept: used when the browser cannot encrypt (no IndexedDB or WebCrypto). */
export const DISABLED_STORAGE: AsyncStorage = {
  getItem: () => Promise.resolve(null),
  setItem: () => Promise.resolve(),
  removeItem: () => Promise.resolve(),
};

/** The checkout draft holds personal data: it is only saved encrypted, or not at all. */
export const createCheckoutStorage = (): AsyncStorage => {
  try {
    return typeof indexedDB === 'undefined' ||
      typeof crypto === 'undefined' ||
      // Only secure pages (HTTPS or localhost) have it, although its type says otherwise.
      (crypto as Partial<Crypto>).subtle === undefined
      ? DISABLED_STORAGE
      : new EncryptedStorage(localStorage, indexedDbKeyStore(indexedDB), crypto.subtle);
  } catch {
    // localStorage throws when the browser blocks storage.
    return DISABLED_STORAGE;
  }
};

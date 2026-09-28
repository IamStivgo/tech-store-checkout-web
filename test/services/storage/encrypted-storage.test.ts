/**
 * WebCrypto needs the Node environment: jsdom has no SubtleCrypto.
 * @jest-environment node
 */
import {
  DISABLED_STORAGE,
  EncryptedStorage,
  type KeyStore,
} from '../../../src/services/storage/encrypted-storage';

/** Synchronous Web Storage in memory, like localStorage. */
class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();

  get length(): number {
    return this.values.size;
  }

  clear(): void {
    this.values.clear();
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  key(index: number): string | null {
    return [...this.values.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

const memoryKeyStore = (): KeyStore & { saved: () => CryptoKey | undefined } => {
  let key: CryptoKey | undefined;
  return {
    load: () => Promise.resolve(key),
    save: (created) => {
      key = created;
      return Promise.resolve();
    },
    saved: () => key,
  };
};

const DRAFT = JSON.stringify({
  customer: { fullName: 'Ana María Gómez', email: 'ana@example.com' },
});

describe('EncryptedStorage', () => {
  it('stores only ciphertext and reads the value back', async () => {
    const storage = new MemoryStorage();
    const encrypted = new EncryptedStorage(storage, memoryKeyStore(), crypto.subtle);

    await encrypted.setItem('checkout', DRAFT);

    const stored = storage.getItem('checkout') ?? '';
    expect(stored).toMatch(/^enc:v1:/);
    expect(stored).not.toMatch(/Ana|example\.com|customer/);
    expect(await encrypted.getItem('checkout')).toBe(DRAFT);
  });

  it('uses a new IV for every write', async () => {
    const storage = new MemoryStorage();
    const encrypted = new EncryptedStorage(storage, memoryKeyStore(), crypto.subtle);

    await encrypted.setItem('checkout', DRAFT);
    const first = storage.getItem('checkout');
    await encrypted.setItem('checkout', DRAFT);

    expect(storage.getItem('checkout')).not.toBe(first);
  });

  it('keeps a key that cannot be exported, and reuses it after a reload', async () => {
    const storage = new MemoryStorage();
    const keys = memoryKeyStore();
    await new EncryptedStorage(storage, keys, crypto.subtle).setItem('checkout', DRAFT);

    const key = keys.saved();
    if (!key) {
      throw new Error('The key was not saved');
    }
    expect(key.extractable).toBe(false);
    await expect(crypto.subtle.exportKey('raw', key)).rejects.toThrow();
    expect(await new EncryptedStorage(storage, keys, crypto.subtle).getItem('checkout')).toBe(
      DRAFT,
    );
  });

  it.each([
    ['saved in plain text', () => DRAFT],
    ['encrypted with another key', () => 'enc:v1:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'],
    ['tampered with', () => 'enc:v1:not-base64!'],
  ])('drops a value %s', async (_case, stored) => {
    const storage = new MemoryStorage();
    storage.setItem('checkout', stored());
    const encrypted = new EncryptedStorage(storage, memoryKeyStore(), crypto.subtle);

    expect(await encrypted.getItem('checkout')).toBeNull();
    expect(storage.getItem('checkout')).toBeNull();
  });

  it('reads nothing when nothing was saved, and removes values', async () => {
    const storage = new MemoryStorage();
    const encrypted = new EncryptedStorage(storage, memoryKeyStore(), crypto.subtle);
    await encrypted.setItem('checkout', DRAFT);

    await encrypted.removeItem('checkout');

    expect(await encrypted.getItem('checkout')).toBeNull();
  });

  it('keeps working when the storage is full or blocked', async () => {
    const blocked = new MemoryStorage();
    blocked.setItem = () => {
      throw new Error('QuotaExceededError');
    };
    const encrypted = new EncryptedStorage(blocked, memoryKeyStore(), crypto.subtle);

    await expect(encrypted.setItem('checkout', DRAFT)).resolves.toBeUndefined();
  });
});

describe('DISABLED_STORAGE', () => {
  it('keeps nothing when the browser cannot encrypt', async () => {
    await DISABLED_STORAGE.setItem('checkout', DRAFT);

    expect(await DISABLED_STORAGE.getItem('checkout')).toBeNull();
    await expect(DISABLED_STORAGE.removeItem('checkout')).resolves.toBeUndefined();
  });
});

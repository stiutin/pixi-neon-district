import {beforeEach, describe, expect, it, vi} from 'vitest';

import {DEFAULT_SAVE, type KeyValueStorage, SaveGame} from './SaveGame';

class MemoryStorage implements KeyValueStorage {
  public readonly data = new Map<string, string>();
  public getItem(key: string): string | null {
    return this.data.get(key) ?? null;
  }
  public setItem(key: string, value: string): void {
    this.data.set(key, value);
  }
  public removeItem(key: string): void {
    this.data.delete(key);
  }
}

const KEY = 'test-save';

describe('SaveGame', () => {
  let storage: MemoryStorage;
  let save: SaveGame;

  beforeEach(() => {
    storage = new MemoryStorage();
    save = new SaveGame(KEY, storage);
  });

  it('returns defaults when nothing is stored', () => {
    expect(save.load()).toEqual(DEFAULT_SAVE);
  });

  it('round-trips data', () => {
    const data = {collectedIds: ['shard-01', 'shard-03'], soundEnabled: false};
    save.save(data);
    expect(save.load()).toEqual(data);
  });

  it('clears the stored save', () => {
    save.save({collectedIds: ['a'], soundEnabled: true});
    save.clear();
    expect(storage.data.has(KEY)).toBe(false);
  });

  it('recovers from corrupted JSON', () => {
    storage.setItem(KEY, '{not json');
    expect(save.load()).toEqual(DEFAULT_SAVE);
  });

  it('works without any storage', () => {
    const noStorage = new SaveGame(KEY, null);
    expect(() => {
      noStorage.save({collectedIds: [], soundEnabled: true});
    }).not.toThrow();
    expect(noStorage.load()).toEqual(DEFAULT_SAVE);
  });

  it('does not throw when storage throws (quota, private mode)', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const failing: KeyValueStorage = {
      getItem: () => {
        throw new Error('denied');
      },
      setItem: () => {
        throw new Error('quota');
      },
      removeItem: () => {
        throw new Error('denied');
      },
    };
    const safe = new SaveGame(KEY, failing);

    expect(() => {
      safe.save({collectedIds: [], soundEnabled: true});
    }).not.toThrow();
    expect(safe.load()).toEqual(DEFAULT_SAVE);
  });
});

describe('SaveGame.parse', () => {
  it('drops invalid and duplicate ids', () => {
    expect(SaveGame.parse({collectedIds: ['a', 1, null, 'a', 'b'], soundEnabled: true})).toEqual({
      collectedIds: ['a', 'b'],
      soundEnabled: true,
    });
  });

  it('falls back per field', () => {
    expect(SaveGame.parse({collectedIds: 'nope', soundEnabled: 'yes'})).toEqual(DEFAULT_SAVE);
  });

  it('rejects non-object values', () => {
    expect(SaveGame.parse(null)).toEqual(DEFAULT_SAVE);
    expect(SaveGame.parse(42)).toEqual(DEFAULT_SAVE);
  });
});

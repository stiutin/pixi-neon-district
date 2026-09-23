export interface SaveData {
  readonly collectedIds: readonly string[];
  readonly soundEnabled: boolean;
}

export type KeyValueStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export const DEFAULT_SAVE: SaveData = { collectedIds: [], soundEnabled: true };

function getBrowserStorage(): KeyValueStorage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export class SaveGame {
  constructor(
    private readonly key: string,
    private readonly storage: KeyValueStorage | null = getBrowserStorage(),
  ) {}

  public load(): SaveData {
    const raw = this.tryStorage((storage) => storage.getItem(this.key));
    if (!raw) return DEFAULT_SAVE;

    try {
      return SaveGame.parse(JSON.parse(raw));
    } catch {
      return DEFAULT_SAVE;
    }
  }

  public save(data: SaveData): void {
    this.tryStorage((storage) => {
      storage.setItem(this.key, JSON.stringify(data));
    });
  }

  public clear(): void {
    this.tryStorage((storage) => {
      storage.removeItem(this.key);
    });
  }

  public static parse(value: unknown): SaveData {
    if (typeof value !== "object" || value === null) return DEFAULT_SAVE;

    const candidate = value as Partial<Record<keyof SaveData, unknown>>;
    const collectedIds = Array.isArray(candidate.collectedIds)
      ? [...new Set(candidate.collectedIds.filter((id): id is string => typeof id === "string"))]
      : [];
    const soundEnabled =
      typeof candidate.soundEnabled === "boolean"
        ? candidate.soundEnabled
        : DEFAULT_SAVE.soundEnabled;

    return { collectedIds, soundEnabled };
  }

  private tryStorage<T>(operation: (storage: KeyValueStorage) => T): T | null {
    if (!this.storage) return null;

    try {
      return operation(this.storage);
    } catch (error) {
      console.warn("[SaveGame] Storage is unavailable:", error);
      return null;
    }
  }
}

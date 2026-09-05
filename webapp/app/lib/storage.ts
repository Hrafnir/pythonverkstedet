export function readStored<T>(key: string, fallback: T, valid: (value: unknown) => boolean = () => true): T {
  try { const raw = localStorage.getItem(key); if (!raw) return fallback; const value: unknown = JSON.parse(raw); return valid(value) ? value as T : fallback; }
  catch { return fallback; }
}
export function writeStored(key: string, value: unknown): boolean {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch { return false; }
}
export const isCodeMap = (value: unknown) => !!value && typeof value === "object" && !Array.isArray(value) && Object.values(value).every(item => typeof item === "string");

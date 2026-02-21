/**
 * Canonical JSON stringify with stable key ordering.
 * Ensures identical objects produce identical strings for hashing.
 */
export function canonicalJsonStringify(obj: unknown): string {
  return JSON.stringify(obj, (_key, value) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return Object.keys(value).sort().reduce<Record<string, unknown>>((sorted, k) => {
        sorted[k] = (value as Record<string, unknown>)[k];
        return sorted;
      }, {});
    }
    return value;
  });
}

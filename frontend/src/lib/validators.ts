export function validateSymbol(symbol: string | null | undefined): string {
  if (!symbol || typeof symbol !== 'string') {
    throw new Error('Invalid symbol');
  }
  const clean = symbol.trim().toUpperCase();
  if (clean.length === 0) {
    throw new Error('Symbol cannot be empty');
  }
  return clean;
}

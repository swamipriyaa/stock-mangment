import { StockData } from './types';
import { validateSymbol } from './validators';

// This file is safe for both server and client contexts.
// - getOrFetchStock and getBatchStocks call the Next.js /api/stock route (which uses yahoo-finance2)
// - auth-required calls (watchlist, portfolio, alerts) are in stock-service-client.ts

// Internal base URL for server-side calls within Next.js
function getBaseUrl(): string {
  // On the server, we need an absolute URL for fetch()
  if (typeof window === 'undefined') {
    return process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  }
  return '';
}

export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://127.0.0.1:8080';

export async function getOrFetchStock(rawSymbol: string): Promise<StockData> {
  const symbol = validateSymbol(rawSymbol);
  const base = getBaseUrl();

  const res = await fetch(`${base}/api/stock?symbol=${encodeURIComponent(symbol)}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Stock API error: ${res.status} for symbol ${symbol}`);
  }

  const data = await res.json();
  return mapToStockData(data);
}

export async function getBatchStocks(symbols: string[]): Promise<StockData[]> {
  if (symbols.length === 0) return [];
  const results = await Promise.all(
    symbols.map(async (sym) => {
      try {
        return await getOrFetchStock(sym);
      } catch {
        return null;
      }
    })
  );
  return results.filter((s): s is StockData => s !== null);
}

export async function getStockHistory(symbol: string, timeframe: string = 'all'): Promise<any[]> {
  const res = await fetch(`${BACKEND_URL}/api/stock/history?symbol=${symbol}&timeframe=${timeframe}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Backend history error: ${res.status}`);
  return await res.json();
}

export function mapToStockData(data: any): StockData {
  return {
    symbol: data.symbol,
    price: data.price,
    change: data.change,
    changePercent: data.changePercent,
    currency: data.currency,
    marketTime: data.marketTime,
    updatedAt: data.updatedAt,
    source: 'market',
  };
}

'use client';

// This file is now configured for ZERO SECURITY / SIMPLE MODE.
// All requests are sent without auth headers, and the backend handles identity.

import { createClient } from '@/utils/supabase/client';
import { BACKEND_URL, mapToStockData } from './stock-service';
import { StockData } from './types';

async function getHeaders(): Promise<HeadersInit> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  return {
    'Content-Type': 'application/json',
    ...(session ? { 'Authorization': `Bearer ${session.access_token}` } : {})
  };
}

export async function getBatchStocksWithAuth(symbols: string[]): Promise<StockData[]> {
  if (symbols.length === 0) return [];
  try {
    const res = await fetch(`${BACKEND_URL}/api/stock/batch?symbols=${symbols.join(',')}`, {
      cache: 'no-store',
      headers: await getHeaders()
    });
    if (!res.ok) throw new Error(`Backend error: ${res.status}`);
    const data = await res.json();
    return data.map(mapToStockData);
  } catch (error) {
    console.error('Failed to fetch batch stocks:', error);
    return [];
  }
}

export async function getWatchlist(): Promise<string[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/watchlist`, {
      cache: 'no-store',
      headers: await getHeaders()
    });
    if (!res.ok) throw new Error(`Backend error: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch watchlist:', error);
    return [];
  }
}

export async function addToWatchlist(symbol: string): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/watchlist?symbol=${symbol}`, {
      method: 'POST',
      headers: await getHeaders()
    });
    return res.ok;
  } catch (error) {
    console.error('Failed to add to watchlist:', error);
    return false;
  }
}

export async function removeFromWatchlist(symbol: string): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/watchlist/${symbol}`, {
      method: 'DELETE',
      headers: await getHeaders()
    });
    return res.ok;
  } catch (error) {
    console.error('Failed to remove from watchlist:', error);
    return false;
  }
}

export async function getPortfolio(): Promise<any[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/portfolio`, {
      cache: 'no-store',
      headers: await getHeaders()
    });
    if (!res.ok) throw new Error(`Backend error: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch portfolio:', error);
    return [];
  }
}

export async function addPortfolioHolding(symbol: string, quantity: number, buyPrice: number): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/portfolio?symbol=${symbol}&quantity=${quantity}&buyPrice=${buyPrice}`, {
      method: 'POST',
      headers: await getHeaders()
    });
    return res.ok;
  } catch (error) {
    console.error('Failed to add holding:', error);
    return false;
  }
}

export async function getAlerts(): Promise<any[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/alerts`, {
      cache: 'no-store',
      headers: await getHeaders()
    });
    if (!res.ok) throw new Error(`Backend error: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch alerts:', error);
    return [];
  }
}

export async function createAlert(symbol: string, targetPrice: number, condition: 'ABOVE' | 'BELOW'): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/alerts?symbol=${symbol}&targetPrice=${targetPrice}&condition=${condition}`, {
      method: 'POST',
      headers: await getHeaders()
    });
    return res.ok;
  } catch (error) {
    console.error('Failed to create alert:', error);
    return false;
  }
}

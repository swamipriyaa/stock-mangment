import { createClient } from '@/utils/supabase/server';
import { StockData } from './types';

// Check if cache is fresh (10 seconds TTL default)
export function isCacheFresh(updatedAt: string, ttlSeconds: number = 10): boolean {
  const updatedDate = new Date(updatedAt);
  const now = new Date();
  const diffInSeconds = (now.getTime() - updatedDate.getTime()) / 1000;
  return diffInSeconds <= ttlSeconds;
}

export async function getCachedStock(symbol: string): Promise<{ data: StockData | null, stale: boolean }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('stocks_current')
      .select('*')
      .eq('symbol', symbol)
      .single();

    if (error || !data) {
      return { data: null, stale: true };
    }

    const stockData: StockData = {
      symbol: data.symbol,
      price: data.price,
      change: data.change,
      changePercent: data.change_percent,
      currency: data.currency,
      marketTime: data.market_time,
      updatedAt: data.updated_at,
      source: 'cache'
    };

    return {
      data: stockData,
      stale: !isCacheFresh(stockData.updatedAt)
    };
  } catch (error) {
    console.error('Error fetching cache:', error);
    return { data: null, stale: true };
  }
}

export async function saveStockSnapshot(data: StockData): Promise<void> {
  try {
    const supabase = await createClient();
    
    // Upsert into stocks_current
    const { error: upsertError } = await supabase
      .from('stocks_current')
      .upsert({
        symbol: data.symbol,
        price: data.price,
        change: data.change,
        change_percent: data.changePercent,
        currency: data.currency,
        market_time: data.marketTime,
        updated_at: new Date().toISOString()
      }, { onConflict: 'symbol' });

    if (upsertError) {
      console.error('Error upserting current stock:', upsertError);
    }

    // Append to stocks_history
    const { error: historyError } = await supabase
      .from('stocks_history')
      .insert({
        symbol: data.symbol,
        price: data.price,
        captured_at: new Date().toISOString()
      });
      
    if (historyError) {
      console.error('Error inserting stock history:', historyError);
    }
  } catch (error) {
    console.error('Error saving stock snapshot:', error);
  }
}

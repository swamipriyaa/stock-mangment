export interface StockData {
  symbol: string;
  price: number;
  change: number | null;
  changePercent: number | null;
  currency: string;
  marketTime: string | null;
  updatedAt: string;
  source?: 'cache' | 'market';
  stale?: boolean;
}

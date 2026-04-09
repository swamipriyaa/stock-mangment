'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Star, RefreshCw, LayoutDashboard, Bug } from 'lucide-react';
import { getWatchlist, getBatchStocksWithAuth } from '@/lib/stock-service-client';
import { StockData } from '@/lib/types';
import StockCard from '@/components/StockCard';
import { cn } from '@/lib/utils';

export default function WatchlistPage() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchWatchlistData = async () => {
    try {
      if (stocks.length === 0) setLoading(true);
      else setIsRefreshing(true);

      const symbols = await getWatchlist();
      if (symbols.length > 0) {
        const data = await getBatchStocksWithAuth(symbols);
        setStocks(data);
      } else {
        setStocks([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWatchlistData();
    const interval = setInterval(fetchWatchlistData, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-start p-8 md:p-12 lg:p-20">
      <div className="w-full max-w-6xl">
        <div className="flex items-center justify-end mb-12 space-x-4">
          <div className="flex items-center space-x-2 text-moonstone">
            <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin text-powder")} />
            <span className="text-xs uppercase tracking-widest font-bold">
              {isRefreshing ? 'Updating...' : 'Live Sync On'}
            </span>
          </div>
        </div>

        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 flex items-center text-teal-blue">
            <Star className="w-10 h-10 mr-4 text-mint fill-current" />
            Your Watchlist
          </h1>
          <p className="text-moonstone text-lg max-w-2xl">
            Track your favorite assets in real-time. Prices are automatically synced with our Java backend services.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-powder/40 border-t-powder rounded-full animate-spin mb-4" />
            <p className="text-moonstone/60 animate-pulse">Loading your assets...</p>
          </div>
        ) : stocks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stocks.map((stock) => (
              <StockCard key={stock.symbol} stock={stock} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white/40 border border-dashed border-white/60 backdrop-blur-sm rounded-2xl">
            <LayoutDashboard className="w-12 h-12 text-moonstone/60 mb-4" />
            <p className="text-moonstone text-center">Your watchlist is empty.</p>
            <Link href="/" className="mt-4 text-teal-blue/70 font-bold hover:text-teal-blue hover:underline">
              Search for symbols to add them
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

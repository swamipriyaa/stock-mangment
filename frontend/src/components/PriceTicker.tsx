'use client';

import { useState, useEffect } from 'react';
import { StockData } from '@/lib/types';
import { ArrowDownIcon, ArrowUpIcon, Clock, RefreshCw, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PriceTickerProps {
  initialData: StockData;
  symbol: string;
}

export default function PriceTicker({ initialData, symbol }: PriceTickerProps) {
  const [data, setData] = useState<StockData>(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsRefreshing(true);
        const res = await fetch(`/api/stock?symbol=${symbol}`);
        if (res.ok) {
          const newData: StockData = await res.json();
          
          if (newData.price > data.price) {
            setFlash('up');
          } else if (newData.price < data.price) {
            setFlash('down');
          }
          setData(newData);
          setTimeout(() => setFlash(null), 1000);
        }
      } catch (error) {
        console.error("Failed to fetch stock updates", error);
      } finally {
        setIsRefreshing(false);
      }
    };

    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [symbol, data.price]);

  const isPositive = data.change && data.change >= 0;

  return (
    <div className={cn(
      "flex flex-col space-y-6 p-8 rounded-2xl border transition-all duration-500 backdrop-blur-md",
      flash === 'up' ? 'bg-mint/40 border-mint shadow-lg shadow-mint/20' : 
      flash === 'down' ? 'bg-red-500/10 border-red-500/50 shadow-lg' : 
      'bg-white/40 border-white/60 shadow-sm'
    )}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-teal-blue/70 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-teal-blue" />
          Live Price Actions
        </h2>
        <div className={cn("px-3 py-1 rounded-full text-xs font-black", 
          isPositive ? "bg-mint border border-mint/20 text-teal-blue" : "bg-red-500/20 border border-red-500/20 text-red-600")}>
          Market {isPositive ? 'Up' : 'Down'}
        </div>
      </div>
      
      <div className="flex items-end space-x-6">
        <h1 className="text-6xl font-black tracking-tighter text-teal-blue">
          {data.price.toFixed(2)} <span className="text-3xl text-moonstone font-bold">{data.currency}</span>
        </h1>
        {data.change != null && data.changePercent != null && (
          <div className={cn('flex items-center text-3xl font-black mb-2', isPositive ? 'text-teal-blue' : 'text-red-500')}>
            {isPositive ? <ArrowUpIcon className="w-8 h-8 mr-1 text-mint" /> : <ArrowDownIcon className="w-8 h-8 mr-1" />}
            {Math.abs(data.change).toFixed(2)} ({Math.abs(data.changePercent).toFixed(2)}%)
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-moonstone border-t border-moonstone/20 pt-4 mt-2 font-bold">
        <div className="flex items-center bg-white/50 border border-white/60 px-3 py-1.5 rounded-md backdrop-blur-sm" suppressHydrationWarning>
          <Clock className="w-4 h-4 mr-2" />
          Updated: {new Date(data.updatedAt).toLocaleTimeString()}
        </div>
        <div className="flex items-center bg-white/50 border border-white/60 px-3 py-1.5 rounded-md backdrop-blur-sm">
          <RefreshCw className={cn("w-4 h-4 mr-2 text-teal-blue", isRefreshing && "animate-spin text-powder")} />
          {isRefreshing ? 'Syncing...' : `Source: ${data.source === 'cache' ? 'Cache' : 'Market'}`}
        </div>
      </div>
    </div>
  );
}

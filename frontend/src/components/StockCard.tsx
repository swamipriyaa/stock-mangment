import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StockData } from '@/lib/types';
import Link from 'next/link';
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StockCard({ stock }: { stock: StockData }) {
  const isPositive = stock.change && stock.change >= 0;

  return (
    <Link href={`/stock/${stock.symbol}`} className="block group">
      <div className="relative p-6 rounded-2xl bg-white/40 border border-white/60 backdrop-blur-xl transition-all duration-500 hover:bg-white/50 hover:border-powder hover:shadow-2xl hover:shadow-powder/20 hover:-translate-y-1.5 overflow-hidden">
        {/* Abstract Background Accent */}
        <div className={cn(
          "absolute -right-4 -top-4 w-24 h-24 rounded-full blur-[40px] opacity-20 transition-opacity group-hover:opacity-40 mix-blend-multiply",
          isPositive ? "bg-mint" : "bg-red-500"
        )} />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs font-black tracking-[0.2em] text-moonstone uppercase">{stock.symbol}</span>
            <div className={cn(
              "px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tight border",
              isPositive ? "bg-mint/40 text-teal-blue border-white/50" : "bg-red-500/10 text-red-600 border-red-500/20"
            )}>
              Live
            </div>
          </div>

          <div className="flex items-baseline space-x-2 mb-4">
            <span className="text-3xl font-black text-teal-blue tracking-tighter tabular-nums">
              {stock.price.toFixed(2)}
            </span>
            <span className="text-xs font-bold text-teal-blue/60 uppercase tracking-widest">{stock.currency}</span>
          </div>

          {stock.change != null && stock.changePercent != null && (
            <div className={cn(
              'flex items-center text-xs font-black tracking-tight',
              isPositive ? 'text-teal-blue/80' : 'text-red-500'
            )}>
              <div className={cn(
                "p-1 rounded-sm mr-2",
                isPositive ? "bg-mint/40" : "bg-red-500/10"
              )}>
                {isPositive ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
              </div>
              <span>
                {isPositive ? '+' : ''}{Math.abs(stock.change).toFixed(2)} ({Math.abs(stock.changePercent).toFixed(2)}%)
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

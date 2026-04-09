'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Briefcase, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ArrowUpRight,
  ArrowDownRight,
  PieChart
} from 'lucide-react';
import { getPortfolio } from '@/lib/stock-service-client';
import { cn } from '@/lib/utils';

export default function PortfolioPage() {
  const [holdings, setHoldings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const data = await getPortfolio();
        setHoldings(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, []);

  const totalValue = holdings.reduce((sum, h) => sum + h.totalValue, 0);
  const totalPL = holdings.reduce((sum, h) => sum + h.profitLoss, 0);
  const totalCost = totalValue - totalPL;
  const overallReturn = totalCost > 0 ? (totalPL / totalCost) * 100 : 0;
  const isPositive = totalPL >= 0;

  return (
    <div className="flex flex-col items-start p-6 md:p-12 lg:p-20">
      <div className="w-full max-w-6xl">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 flex items-center bg-gradient-to-r from-teal-blue to-teal-blue/70 bg-clip-text text-transparent">
                Portfolio Assets
              </h1>
              <p className="text-moonstone text-lg max-w-xl leading-relaxed">
                Aggregated view of your market positions with real-time performance tracking and automated yield calculations.
              </p>
            </div>
            <div className="flex items-center space-x-2 bg-powder/30 border border-powder/60 px-4 py-2 rounded-full backdrop-blur-md">
              <div className="w-2 h-2 rounded-full bg-powder animate-pulse" />
              <span className="text-xs font-bold text-teal-blue uppercase tracking-tighter">Live Market Feed</span>
            </div>
          </div>
        </div>

        {/* Executive Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <div className="relative overflow-hidden group bg-white/40 border border-white/60 p-8 rounded-3xl backdrop-blur-xl hover:bg-white/50 transition-all duration-300">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Wallet className="w-16 h-16 text-teal-blue" />
            </div>
            <div className="relative z-10">
              <div className="text-moonstone text-xs font-black uppercase tracking-widest mb-4">Net Asset Value</div>
              <div className="text-4xl font-black tracking-tight text-teal-blue">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div className="mt-4 flex items-center text-[10px] font-bold text-teal-blue/70 uppercase tracking-widest">
                <PieChart className="w-3 h-3 mr-2" />
                Across {holdings.length} Positions
              </div>
            </div>
          </div>

          <div className={cn(
            "relative overflow-hidden group p-8 rounded-3xl backdrop-blur-xl transition-all duration-300 border-2",
            isPositive ? "bg-mint/30 border-mint hover:bg-mint/50" : "bg-red-500/5 border-red-500/20 hover:bg-red-500/10"
          )}>
             <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-30 transition-opacity">
              {isPositive ? <TrendingUp className="w-16 h-16 text-teal-blue" /> : <TrendingDown className="w-16 h-16 text-red-500" />}
            </div>
            <div className="relative z-10">
              <div className="text-moonstone text-xs font-black uppercase tracking-widest mb-4">Total Unrealized P&L</div>
              <div className={cn("text-4xl font-black tracking-tight", isPositive ? "text-teal-blue" : "text-red-500")}>
                {isPositive ? '+' : ''}${totalPL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className={cn("mt-4 flex items-center text-xs font-black px-2 py-1 rounded-md w-fit backdrop-blur-sm border", isPositive ? "bg-white/40 text-teal-blue border-white/60" : "bg-red-500/10 text-red-600 border-red-500/20")}>
                {isPositive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                {overallReturn.toFixed(2)}% Overall Yield
              </div>
            </div>
          </div>
        </div>

        {/* Holdings Table */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-powder/40 border-t-powder rounded-full animate-spin" />
            <p className="text-xs font-bold text-moonstone uppercase tracking-widest">Fetching Asset Allocation...</p>
          </div>
        ) : holdings.length > 0 ? (
          <div className="bg-white/40 border border-white/60 rounded-3xl overflow-hidden backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-white/50 border-b border-white/80 text-teal-blue uppercase text-[10px] tracking-[0.2em] font-black">
                    <th className="px-8 py-6">Asset Symbol</th>
                    <th className="px-8 py-6">Position</th>
                    <th className="px-8 py-6">Average Entry</th>
                    <th className="px-8 py-6">Safe Price</th>
                    <th className="px-8 py-6 text-right">Yield Performance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/40">
                  {holdings.map((h) => {
                    const gain = h.profitLoss >= 0;
                    return (
                      <tr key={h.symbol} className="group hover:bg-white/50 transition-all duration-300">
                        <td className="px-8 py-8">
                          <Link href={`/stock/${h.symbol}`} className="flex items-center space-x-3 group/link">
                            <span className="text-xl font-black text-teal-blue group-hover/link:text-powder transition-colors uppercase tracking-tighter">
                              {h.symbol}
                            </span>
                            <ArrowUpRight className="w-4 h-4 text-moonstone opacity-0 group-hover/link:opacity-100 group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-all" />
                          </Link>
                        </td>
                        <td className="px-8 py-8">
                          <div className="text-sm font-bold text-teal-blue/70">{h.quantity} Shares</div>
                        </td>
                        <td className="px-8 py-8 font-mono text-sm text-moonstone">
                          ${h.avgBuyPrice.toFixed(2)}
                        </td>
                        <td className="px-8 py-8 font-mono text-sm font-black text-teal-blue">
                          ${h.currentPrice.toFixed(2)}
                        </td>
                        <td className="px-8 py-8 text-right">
                          <div className={cn(
                            "inline-flex items-center px-4 py-2 rounded-xl text-xs font-black tracking-tight transition-all group-hover:scale-105 border",
                            gain ? "bg-mint/40 text-teal-blue border-white/60" : "bg-red-500/10 text-red-600 border-red-500/20"
                          )}>
                            {gain ? '+' : ''}{h.profitLossPercent.toFixed(2)}%
                          </div>
                          <div className={cn("text-xs mt-2 font-bold", gain ? "text-teal-blue/60" : "text-red-500")}>
                            {gain ? '+' : ''}${h.profitLoss.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="py-24 flex flex-col items-center justify-center border-2 border-dashed border-white/60 rounded-[3rem] bg-white/30 backdrop-blur-md">
            <div className="p-6 bg-white/60 rounded-full mb-6">
              <Briefcase className="w-12 h-12 text-teal-blue/50" />
            </div>
            <h3 className="text-xl font-bold text-teal-blue mb-2">No active positions found</h3>
            <p className="text-moonstone text-sm max-w-xs text-center mb-8">
              Your investment dashboard is waiting. Start building your portfolio by adding stocks from the market view.
            </p>
            <Link href="/" className="px-8 py-4 bg-teal-blue text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-teal-blue/80 transition-colors shadow-lg">
              Explore Markets
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

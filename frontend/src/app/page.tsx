import SearchBar from '@/components/SearchBar';
import StockCard from '@/components/StockCard';
import { getOrFetchStock } from '@/lib/stock-service';
import Link from 'next/link';
import { Star } from 'lucide-react';
import UserNav from '@/components/UserNav';

// Revalidate this page every 60 seconds manually if we wanted ISR,
// but since we are dynamically fetching based on search we'll rely on our cache.
export const revalidate = 60;

export default async function Home() {
  const defaultSymbols = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 
    'BTC-USD', 'ETH-USD', 
    'RELIANCE.NS', 'TCS.NS', 'INFY.NS', 'HDFCBANK.NS'
  ];
  
  // Fetch featured stocks in parallel
  const featuredStocks = await Promise.all(
    defaultSymbols.map(async (sym) => {
      try {
        return await getOrFetchStock(sym);
      } catch (err) {
        return null;
      }
    })
  );

  const validStocks = featuredStocks.filter(s => s !== null);

  return (
    <div className="flex flex-col items-center p-8 md:p-12 lg:p-20">
      <div className="flex flex-col items-center justify-center space-y-8 w-full max-w-2xl mt-12 mb-20">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-center bg-clip-text text-transparent bg-gradient-to-r from-teal-blue to-moonstone">
          Live Market Pulse
        </h1>
        <p className="text-moonstone text-lg text-center max-w-lg mb-4">
          Search for any stock symbol to get real-time cached pricing data without premium API costs.
        </p>
        <SearchBar />
      </div>

      <div className="w-full max-w-5xl">
        <h2 className="text-2xl font-bold mb-6 text-teal-blue/80">Featured Stocks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {validStocks.map((stock) => (
            stock && <StockCard key={stock.symbol} stock={stock} />
          ))}
        </div>
        {validStocks.length === 0 && (
          <p className="text-moonstone/60 italic">Market data currently unavailable.</p>
        )}
      </div>
    </div>
  );
}

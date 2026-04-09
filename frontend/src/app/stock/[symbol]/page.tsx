import { getOrFetchStock } from '@/lib/stock-service';
import PriceTicker from '@/components/PriceTicker';
import WatchlistButton from '@/components/WatchlistButton';
import StockChart from '@/components/StockChart';
import StockActions from '@/components/StockActions';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params;
  return {
    title: `${symbol.toUpperCase()} | Stock Tracker`,
    description: `Live price and tracking for ${symbol.toUpperCase()}`
  };
}

export default async function StockPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params;
  const formattedSymbol = symbol.toUpperCase();

  let initialData = null;
  try {
    initialData = await getOrFetchStock(formattedSymbol);
  } catch (error) {
    console.error(error);
    notFound();
  }

  return (
    <main className="flex flex-col items-center p-8 md:p-24">
      <div className="w-full max-w-6xl space-y-12">
        <div>
          <Link href="/" className="inline-flex items-center text-sm font-bold text-moonstone hover:text-teal-blue mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          
          <div className="mb-8 border-b border-moonstone/20 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-teal-blue">
                {formattedSymbol}
              </h1>
              <p className="text-moonstone">
                Real-time market data directly from cached sources.
              </p>
            </div>
            <WatchlistButton symbol={formattedSymbol} />
          </div>

          <PriceTicker initialData={initialData} symbol={formattedSymbol} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-teal-blue">Price Movement</h2>
            <StockChart symbol={formattedSymbol} />
          </div>
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-teal-blue">Manage Asset</h2>
            <StockActions symbol={formattedSymbol} currentPrice={initialData.price} />
          </div>
        </div>
      </div>
    </main>
  );
}

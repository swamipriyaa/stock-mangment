'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Star, StarOff } from 'lucide-react';
import { addToWatchlist, removeFromWatchlist, getWatchlist } from '@/lib/stock-service-client';
import { cn } from '@/lib/utils';

export default function WatchlistButton({ symbol }: { symbol: string }) {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const watchlist = await getWatchlist();
        setIsSaved(watchlist.includes(symbol));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    checkStatus();
  }, [symbol]);

  const toggleWatchlist = async () => {
    setLoading(true);
    try {
      if (isSaved) {
        await removeFromWatchlist(symbol);
        setIsSaved(false);
      } else {
        await addToWatchlist(symbol);
        setIsSaved(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="lg"
      disabled={loading}
      onClick={toggleWatchlist}
      className={cn(
        "transition-all duration-300 h-12 px-6 font-bold shadow-sm backdrop-blur-md",
        isSaved ? "bg-mint border-mint/50 text-teal-blue hover:bg-mint/80" : "bg-white/40 text-moonstone border border-white/60 hover:text-teal-blue hover:bg-white/60"
      )}
    >
      {isSaved ? <StarOff className="w-5 h-5 mr-2 fill-current" /> : <Star className="w-5 h-5 mr-2" />}
      {isSaved ? 'Remove from Watchlist' : 'Add to Watchlist'}
    </Button>
  );
}

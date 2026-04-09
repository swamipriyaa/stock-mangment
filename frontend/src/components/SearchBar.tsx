'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export default function SearchBar() {
  const [symbol, setSymbol] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (symbol.trim()) {
      router.push(`/stock/${symbol.trim().toUpperCase()}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex w-full max-w-md items-center space-x-2">
      <Input
        type="text"
        placeholder="Search for a stock symbol (e.g. AAPL, RELIANCE.NS)"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
        className="flex-1 bg-white/40 border-white/60 text-teal-blue placeholder:text-moonstone focus-visible:ring-powder h-12 text-lg backdrop-blur-sm shadow-sm"
      />
      <Button type="submit" size="lg" className="bg-teal-blue hover:bg-teal-blue/80 text-white h-12 px-6 shadow-md">
        <Search className="w-5 h-5 mr-2" />
        Search
      </Button>
    </form>
  );
}

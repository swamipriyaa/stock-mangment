'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Briefcase, 
  Bell, 
  Plus, 
  ArrowUpCircle, 
  ArrowDownCircle,
  CheckCircle2
} from 'lucide-react';
import { addPortfolioHolding, createAlert } from '@/lib/stock-service-client';
import { cn } from '@/lib/utils';

export default function StockActions({ symbol, currentPrice }: { symbol: string, currentPrice: number }) {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'portfolio' | 'alert'>('portfolio');
  
  // Portfolio state
  const [quantity, setQuantity] = useState('');
  const [buyPrice, setBuyPrice] = useState(currentPrice.toString());
  
  // Alert state
  const [targetPrice, setTargetPrice] = useState(currentPrice.toString());
  const [condition, setCondition] = useState<'ABOVE' | 'BELOW'>('ABOVE');
  
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, []);

  const handleAddPortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const q = parseFloat(quantity);
      const b = parseFloat(buyPrice);
      if (isNaN(q) || isNaN(b) || q <= 0) throw new Error('Invalid input');
      
      const success = await addPortfolioHolding(symbol, q, b);
      if (success) {
        setStatus({ type: 'success', msg: `Added ${q} units of ${symbol} to portfolio!` });
        setQuantity('');
      } else throw new Error('Failed to save');
    } catch (err: any) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSetAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
        const t = parseFloat(targetPrice);
        if (isNaN(t)) throw new Error('Invalid price');
        
        const success = await createAlert(symbol, t, condition);
        if (success) {
            setStatus({ type: 'success', msg: `Alert set for ${symbol} ${condition} $${t}` });
        } else throw new Error('Failed to save alert');
    } catch (err: any) {
        setStatus({ type: 'error', msg: err.message });
    } finally {
        setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-8 bg-white/40 border border-white/60 rounded-2xl text-center shadow-sm backdrop-blur-md">
        <p className="text-moonstone mb-4 text-sm">Sign in to track this stock in your portfolio or set price alerts.</p>
        <Button variant="outline" className="border-powder/50 text-teal-blue hover:bg-powder/30" asChild>
          <a href="/login">Login / Sign Up</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white/40 border border-white/60 rounded-3xl overflow-hidden backdrop-blur-xl shadow-md">
      <div className="flex border-b border-white/60">
        <button
          onClick={() => { setActiveTab('portfolio'); setStatus(null); }}
          className={cn(
            "flex-1 py-4 text-sm font-bold flex items-center justify-center transition-all",
            activeTab === 'portfolio' ? "bg-teal-blue text-white" : "text-moonstone hover:text-teal-blue"
          )}
        >
          <Briefcase className="w-4 h-4 mr-2" />
          Portfolio
        </button>
        <button
          onClick={() => { setActiveTab('alert'); setStatus(null); }}
          className={cn(
            "flex-1 py-4 text-sm font-bold flex items-center justify-center transition-all",
            activeTab === 'alert' ? "bg-mint text-teal-blue" : "text-moonstone hover:text-teal-blue"
          )}
        >
          <Bell className="w-4 h-4 mr-2" />
          Set Alert
        </button>
      </div>

      <div className="p-8">
        {status && (
          <div className={cn(
            "mb-6 p-4 rounded-xl text-sm font-medium flex items-center animate-in fade-in slide-in-from-top-2 border shadow-sm",
            status.type === 'success' ? "bg-mint/40 text-teal-blue border-mint" : "bg-red-500/20 text-red-600 border-red-500/20"
          )}>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            {status.msg}
          </div>
        )}

        {activeTab === 'portfolio' ? (
          <form onSubmit={handleAddPortfolio} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-moonstone font-bold">Quantity</Label>
                <Input 
                  placeholder="0.00" 
                  value={quantity} 
                  onChange={(e) => setQuantity(e.target.value)}
                  className="bg-white/50 border-white/80 focus:border-powder h-12 text-teal-blue font-bold backdrop-blur-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-moonstone font-bold">Buy Price ($)</Label>
                <Input 
                  placeholder="0.00" 
                  value={buyPrice} 
                  onChange={(e) => setBuyPrice(e.target.value)}
                  className="bg-white/50 border-white/80 focus:border-powder h-12 text-teal-blue font-bold backdrop-blur-sm"
                />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full h-12 bg-teal-blue text-white hover:bg-teal-blue/80 font-bold text-base shadow-lg shadow-teal-blue/20">
              <Plus className="w-5 h-5 mr-2" />
              Add to Portfolio
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSetAlert} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-moonstone font-bold">Target Price ($)</Label>
              <Input 
                placeholder="0.00" 
                value={targetPrice} 
                onChange={(e) => setTargetPrice(e.target.value)}
                className="bg-white/50 border-white/80 focus:border-mint h-12 text-lg text-teal-blue font-bold backdrop-blur-sm"
              />
            </div>
            <div className="flex gap-2 p-1 bg-white/50 rounded-xl border border-white/60 shadow-sm backdrop-blur-sm">
              <Button
                type="button"
                onClick={() => setCondition('ABOVE')}
                className={cn(
                  "flex-1 h-12 rounded-lg font-bold transition-all shadow-sm",
                  condition === 'ABOVE' ? "bg-mint text-teal-blue border border-mint/50" : "bg-transparent text-moonstone hover:text-teal-blue hover:bg-white/40 border border-transparent"
                )}
              >
                <ArrowUpCircle className="w-4 h-4 mr-2" />
                Above
              </Button>
              <Button
                type="button"
                onClick={() => setCondition('BELOW')}
                className={cn(
                  "flex-1 h-12 rounded-lg font-bold transition-all shadow-sm",
                  condition === 'BELOW' ? "bg-teal-blue text-white border border-teal-blue/50" : "bg-transparent text-moonstone hover:text-teal-blue hover:bg-white/40 border border-transparent"
                )}
              >
                <ArrowDownCircle className="w-4 h-4 mr-2" />
                Below
              </Button>
            </div>
            <Button type="submit" disabled={loading} className="w-full h-12 bg-mint text-teal-blue hover:bg-mint/80 font-bold text-base shadow-lg shadow-mint/20">
              <Bell className="w-5 h-5 mr-2" />
              Set Price Alert
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

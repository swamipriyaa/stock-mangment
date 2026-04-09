'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bell, BellOff, CheckCircle2, AlertTriangle, Trash2 } from 'lucide-react';
import { getAlerts } from '@/lib/stock-service-client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const data = await getAlerts();
      setAlerts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  return (
    <main className="flex flex-col items-center p-8 md:p-24 text-teal-blue">
      <div className="w-full max-w-4xl">
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center text-sm font-bold text-moonstone hover:text-teal-blue transition-colors mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-5xl font-black tracking-tighter mb-4 flex items-center text-teal-blue">
            <Bell className="w-10 h-10 mr-4 text-mint fill-current drop-shadow-md" />
            Price Alerts
          </h1>
          <p className="text-moonstone text-lg max-w-2xl font-medium">
            Stay informed with real-time notifications when your favorite stocks hit target price thresholds.
          </p>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-2 border-mint border-t-transparent rounded-full animate-spin" />
          </div>
        ) : alerts.length > 0 ? (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className={cn(
                "group relative p-6 rounded-2xl border transition-all duration-300 backdrop-blur-md",
                alert.isTriggered ? "bg-mint/40 border-mint shadow-md" : "bg-white/40 border-white/60 hover:border-teal-blue/30 shadow-sm"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={cn("p-3 rounded-xl border", alert.isTriggered ? "bg-mint/60 border-mint" : "bg-white/50 border-white/60")}>
                      {alert.isTriggered ? <CheckCircle2 className="w-6 h-6 text-teal-blue" /> : <Bell className="w-6 h-6 text-moonstone" />}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-black text-xl tracking-tight text-teal-blue">{alert.symbol}</span>
                        {alert.isTriggered && (
                          <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-mint border border-mint/50 text-teal-blue rounded shadow-sm">Triggered</span>
                        )}
                      </div>
                      <p className="text-moonstone text-sm mt-1 font-medium">
                        Alert when price goes <span className="text-teal-blue font-bold">{alert.condition}</span> <strong>${alert.targetPrice.toFixed(2)}</strong>
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 hover:text-red-500 text-moonstone">
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center border border-dashed border-white/60 rounded-3xl bg-white/40 shadow-sm backdrop-blur-md">
            <BellOff className="w-12 h-12 text-teal-blue/50 mb-4" />
            <p className="text-moonstone font-bold">No active price alerts.</p>
            <p className="text-teal-blue/70 text-sm mt-2 text-center max-w-xs">Visit a stock detail page to set your first threshold alert.</p>
          </div>
        )}
      </div>
    </main>
  );
}

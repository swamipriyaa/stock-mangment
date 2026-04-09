'use client';

import { useState, useEffect } from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { getStockHistory } from '@/lib/stock-service';
import { format } from 'date-fns';
import { Button } from './ui/button';

const TIMEFRAMES = [
  { id: '1h', label: '1H' },
  { id: '1d', label: '1D' },
  { id: '1w', label: '1W' },
  { id: '1m', label: '1M' },
  { id: 'all', label: 'ALL' },
];

export default function StockChart({ symbol }: { symbol: string }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('1d');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await getStockHistory(symbol, timeframe);
        const formattedData = history.map((h: any) => ({
          time: format(new Date(h.capturedAt), timeframe === '1h' ? 'HH:mm:ss' : 'MMM dd HH:mm'),
          fullDate: new Date(h.capturedAt).toLocaleString(),
          price: parseFloat(h.price.toFixed(2))
        }));
        setData(formattedData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
    const interval = setInterval(fetchHistory, 10000);
    return () => clearInterval(interval);
  }, [symbol, timeframe]);

  if (loading && data.length === 0) {
    return (
      <div className="w-full h-[400px] bg-white/40 border border-white/60 rounded-xl animate-pulse flex items-center justify-center">
        <p className="text-moonstone">Generating chart data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-sm font-bold text-teal-blue/70 uppercase tracking-wider">Performance Tracking</h3>
        <div className="flex bg-white/60 p-1 rounded-lg border border-white/80 backdrop-blur-md shadow-sm">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.id}
              onClick={() => {
                setTimeframe(tf.id);
                setLoading(true);
              }}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all duration-200 ${
                timeframe === tf.id 
                ? 'bg-teal-blue text-white shadow-md shadow-teal-blue/20' 
                : 'text-moonstone hover:text-teal-blue hover:bg-white/40'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full h-[450px] p-6 bg-white/40 rounded-2xl border border-white/60 backdrop-blur-xl shadow-lg relative group transition-all duration-500 hover:border-powder/80">
        {data.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
             <div className="p-6 bg-mint/30 rounded-full border border-mint animate-pulse shadow-sm">
               <svg className="w-10 h-10 text-mint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
             </div>
             <div className="text-center">
               <p className="text-teal-blue font-bold">Analyzing Market Patterns</p>
               <p className="text-moonstone text-sm mt-1">Collecting real-time data for {TIMEFRAMES.find(t => t.id === timeframe)?.label}...</p>
             </div>
          </div>
        ) : (
          <div className="w-full h-full min-h-[350px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#73A9C2" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#73A9C2" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
              <XAxis 
                dataKey="time" 
                stroke="#B0E0E6" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false}
                minTickGap={60}
                tick={{ fill: '#73A9C2' }}
              />
              <YAxis 
                stroke="#B0E0E6" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false}
                domain={['auto', 'auto']}
                tickFormatter={(value) => `$${value}`}
                tick={{ fill: '#73A9C2' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(245, 245, 245, 0.9)', 
                  border: '1px solid rgba(255,255,255,1)', 
                  borderRadius: '16px',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                  padding: '12px'
                }}
                itemStyle={{ color: '#367588', fontWeight: '800' }}
                labelStyle={{ color: '#73A9C2', marginBottom: '6px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                labelFormatter={(label, payload) => payload[0]?.payload?.fullDate || label}
                cursor={{ stroke: '#73A9C2', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke="#73A9C2" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorPrice)" 
                animationDuration={1500}
                isAnimationActive={true}
                dot={{ r: 0 }}
                activeDot={{ r: 6, stroke: '#73A9C2', strokeWidth: 2, fill: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

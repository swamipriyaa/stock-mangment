'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Star, 
  Briefcase, 
  Bell, 
  TrendingUp, 
  Settings,
  ChevronRight,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const NAV_ITEMS = [
  { label: 'Overview', href: '/', icon: LayoutDashboard },
  { label: 'Watchlist', href: '/watchlist', icon: Star },
  { label: 'Portfolio', href: '/portfolio', icon: Briefcase },
  { label: 'Alerts', href: '/alerts', icon: Bell },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-smoke border-r border-moonstone/20 flex flex-col z-50 shadow-sm">
      {/* Brand Header */}
      <div className="p-8 pb-12">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="p-2.5 bg-powder rounded-xl shadow-lg shadow-powder/50 group-hover:scale-110 transition-transform duration-300">
            <TrendingUp className="w-6 h-6 text-teal-blue" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tighter text-teal-blue block leading-none">TERMINAL</span>
            <span className="text-[10px] font-bold tracking-[0.2em] text-moonstone uppercase">Pro Trader</span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-1.5">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-moonstone px-4 mb-4">Operations</div>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group",
                isActive 
                  ? "bg-powder/30 border border-powder/50 text-teal-blue shadow-sm" 
                  : "text-moonstone hover:text-teal-blue hover:bg-powder/20 border border-transparent"
              )}
            >
              <div className="flex items-center">
                <item.icon className={cn(
                  "w-5 h-5 mr-3 transition-colors",
                  isActive ? "text-teal-blue" : "group-hover:text-teal-blue text-moonstone"
                )} />
                <span className="text-sm font-bold tracking-tight">{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-3 h-3 text-teal-blue" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Profile / Auth */}
      <div className="p-4 mt-auto">
        <div className="bg-white/60 border border-white/80 rounded-2xl p-4 backdrop-blur-md shadow-sm">
          {user ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-powder to-mint flex items-center justify-center border border-white/60 shadow-md">
                  <UserIcon className="w-5 h-5 text-teal-blue" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-teal-blue truncate leading-none mb-1">
                    {user.email?.split('@')[0].toUpperCase()}
                  </p>
                  <p className="text-[10px] text-moonstone font-bold truncate">Premium Member</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 py-2 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-all"
              >
                <LogOut className="w-3 h-3" />
                <span>Terminate Session</span>
              </button>
            </div>
          ) : (
            <Link href="/login" className="block w-full">
              <Button className="w-full bg-teal-blue hover:bg-teal-blue/80 text-white font-black text-[10px] uppercase tracking-widest rounded-xl py-6 border-none shadow-xl shadow-teal-blue/20">
                Authenticate
              </Button>
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}

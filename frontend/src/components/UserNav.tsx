'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LogOut, User, LayoutDashboard, Briefcase, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UserNav() {
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

  if (!user) {
    return (
      <Link href="/login">
        <Button variant="outline" className="border-white/60 bg-white/40 hover:bg-white/60 text-teal-blue backdrop-blur-md shadow-sm">
          Sign In
        </Button>
      </Link>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="hidden md:flex items-center space-x-2 mr-4">
        <Link href="/portfolio" className="text-sm font-medium text-moonstone hover:text-teal-blue flex items-center transition-colors">
          <Briefcase className="w-4 h-4 mr-1" />
          Portfolio
        </Link>
        <Link href="/alerts" className="text-sm font-medium text-moonstone hover:text-teal-blue flex items-center ml-4 transition-colors">
          <Bell className="w-4 h-4 mr-1" />
          Alerts
        </Link>
      </div>

      <div className="flex items-center space-x-3 bg-white/40 p-1 pl-3 rounded-full border border-white/60 backdrop-blur-md shadow-sm">
        <span className="text-xs font-bold text-teal-blue/80 hidden sm:inline">
          {user.email?.split('@')[0]}
        </span>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleLogout}
          className="h-8 w-8 hover:bg-red-500/10 hover:text-red-500 rounded-full"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

'use client';

import { createClient } from '@/utils/supabase/client';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [authView, setAuthView] = useState<'sign_in' | 'sign_up'>('sign_in');

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.push('/');
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-smoke text-teal-blue overflow-hidden relative">
      {/* Background Decorators */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-powder/30 rounded-full blur-[120px] -z-10 mix-blend-multiply pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-mint/30 rounded-full blur-[150px] -z-10 mix-blend-multiply pointer-events-none" />

      <div className="w-full max-w-[420px] space-y-8 relative z-10">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center px-4 py-2 bg-white/40 border border-white/60 rounded-full text-xs font-bold text-moonstone hover:text-teal-blue hover:bg-white/60 mb-12 transition-all duration-300 uppercase tracking-widest group">
            <ArrowLeft className="w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform" />
            Return to Terminal
          </Link>
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-powder/50 to-mint/50 border border-white/80 rounded-2xl flex items-center justify-center backdrop-blur-xl">
              <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-teal-blue to-teal-blue/50">AQ</span>
            </div>
          </div>
          <h1 className="text-3xl font-black tracking-tighter mb-2 bg-gradient-to-r from-teal-blue via-teal-blue to-moonstone text-transparent bg-clip-text">Secure Uplink</h1>
          <p className="text-moonstone text-sm">Authenticate to access live market streams.</p>
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-powder to-mint rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
          <div className="relative bg-white/70 p-8 rounded-3xl border border-white/80 backdrop-blur-2xl">
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: 'var(--color-teal-blue)',
                      brandAccent: 'var(--color-powder)',
                      brandButtonText: 'white',
                      defaultButtonBackground: 'rgba(255, 255, 255, 0.5)',
                      defaultButtonBackgroundHover: 'rgba(255, 255, 255, 0.8)',
                      defaultButtonBorder: 'var(--color-powder)',
                      defaultButtonText: 'var(--color-teal-blue)',
                      dividerBackground: 'var(--color-powder)',
                      inputBackground: 'rgba(255, 255, 255, 0.5)',
                      inputBorder: 'rgba(0, 0, 0, 0.1)',
                      inputBorderHover: 'var(--color-powder)',
                      inputBorderFocus: 'var(--color-teal-blue)',
                      inputText: 'var(--color-teal-blue)',
                      inputPlaceholder: 'var(--color-moonstone)',
                      messageText: 'var(--color-teal-blue)',
                    },
                    radii: {
                      borderRadiusButton: '12px',
                      buttonBorderRadius: '12px',
                      inputBorderRadius: '12px',
                    },
                    space: {
                      inputPadding: '14px 16px',
                      buttonPadding: '14px 16px',
                    },
                    fonts: {
                      bodyFontFamily: 'inherit',
                      buttonFontFamily: 'inherit',
                      inputFontFamily: 'inherit',
                      labelFontFamily: 'inherit',
                    },
                  },
                },
                className: {
                  input: 'transition-all duration-300 hover:bg-white/60 focus:bg-white/80 font-mono text-sm border-white focus:border-powder shadow-sm',
                  button: 'transition-all duration-300 font-bold uppercase tracking-widest text-xs shadow-sm hover:shadow-md',
                  label: 'text-xs uppercase tracking-widest font-black text-moonstone mb-2',
                  anchor: 'text-xs text-teal-blue/70 hover:text-teal-blue transition-colors uppercase tracking-wider font-bold',
                  message: 'font-mono text-xs text-teal-blue',
                  divider: 'my-6',
                }
              }}
              providers={[]}
              showLinks={false}
              view={authView}
              redirectTo={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`}
            />
            
            <div className="mt-6 text-center">
              <button 
                onClick={() => setAuthView(authView === 'sign_in' ? 'sign_up' : 'sign_in')}
                className="text-xs text-moonstone hover:text-teal-blue transition-colors uppercase tracking-wider font-bold"
              >
                {authView === 'sign_in' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
              </button>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-8">
          <p className="text-[10px] text-moonstone uppercase tracking-widest font-mono">
            System Status: <span className="text-mint font-black relative"><span className="absolute w-2 h-2 bg-mint rounded-full animate-ping -left-3 top-[3px]"></span><span className="w-2 h-2 bg-mint rounded-full absolute -left-3 top-[3px]"></span>Online</span>
          </p>
        </div>
      </div>
    </main>
  );
}

'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, LockKeyhole, Mail, ShieldCheck, Zap } from 'lucide-react';
import { login } from '@/lib/api';
import { saveAuth } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true); setError('');
    try {
      const result = await login(email, password);
      saveAuth(result.token, result.user);
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to sign in. Check your credentials.');
    } finally { setLoading(false); }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-5 py-10 bg-[var(--page-bg)]">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-700 text-white flex items-center justify-center shadow-lg"><Zap size={22} /></div>
          <div><p className="text-sm font-black text-[var(--text-primary)]">Aryan Tracker</p><p className="text-xs text-[var(--text-tertiary)]">Private command center</p></div>
        </div>
        <section className="p-7 rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-xl backdrop-blur-xl">
          <div className="mb-7"><div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-widest"><ShieldCheck size={14} /> Secure access</div><h1 className="mt-3 text-3xl font-black text-[var(--text-primary)]">Welcome back.</h1><p className="mt-2 text-sm text-[var(--text-secondary)]">Sign in to control your progress, applications, sync, and AI workspace.</p></div>
          <form onSubmit={submit} className="space-y-4">
            <label className="block"><span className="mb-1.5 block text-xs font-bold text-[var(--text-secondary)]">Email</span><div className="relative"><Mail size={16} className="absolute left-3 top-3 text-[var(--text-tertiary)]" /><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--input-bg)] py-2.5 pl-10 pr-3 text-sm text-[var(--text-primary)] outline-none focus:border-amber-600" placeholder="you@example.com" /></div></label>
            <label className="block"><span className="mb-1.5 block text-xs font-bold text-[var(--text-secondary)]">Password</span><div className="relative"><LockKeyhole size={16} className="absolute left-3 top-3 text-[var(--text-tertiary)]" /><input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--input-bg)] py-2.5 pl-10 pr-3 text-sm text-[var(--text-primary)] outline-none focus:border-amber-600" placeholder="Your password" /></div></label>
            {error && <p className="rounded-xl bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-600">{error}</p>}
            <button disabled={loading} className="w-full rounded-xl bg-amber-700 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-amber-800 disabled:opacity-60">{loading ? 'Signing in...' : <span className="flex items-center justify-center gap-2">Open dashboard <ArrowRight size={16} /></span>}</button>
          </form>
        </section>
      </div>
    </main>
  );
}
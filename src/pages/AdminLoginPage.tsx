import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { isSupabaseConfigured } from '../lib/supabase';

type AdminLoginPageProps = {
  onLogin: (payload: { email: string; password: string }) => Promise<void>;
};

export default function AdminLoginPage({ onLogin }: AdminLoginPageProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    if (!isSupabaseConfigured) {
      setError('Supabase authentication is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to continue.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onLogin({ email: email.trim(), password });
      navigate('/admin', { replace: true });
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : 'Unable to sign in. Please check your credentials and try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/30 md:p-8">
      <p className="text-xs uppercase tracking-[0.25em] text-amber-300">STAFF / ADMIN</p>
      <h1 className="mt-3 text-3xl font-bold text-white">Admin Login</h1>
      <p className="mt-3 text-sm text-slate-300">Use your Supabase email and password to access monitoring tools.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="email" className="mb-2 block text-sm text-slate-300">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-amber-400"
            placeholder="admin@smartcinema.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-sm text-slate-300">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-amber-400"
            placeholder="Enter your password"
          />
        </div>

        {error ? <p className="text-sm text-red-300">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full bg-amber-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <button
        type="button"
        onClick={() => navigate('/', { replace: true })}
        className="mt-6 w-full rounded-full border border-white/10 bg-white/5 px-6 py-3 font-medium text-white transition hover:bg-white/10"
      >
        Back to Customer
      </button>
    </section>
  );
}

'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  // Read error parameter from URL if redirected from auth middleware
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'CredentialsSignin') {
      setError('Invalid email or password.');
    } else if (errorParam) {
      setError(errorParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        email: email.toLowerCase(),
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error || 'Invalid credentials');
      } else {
        router.refresh();
        router.push('/dashboard');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-4xl bg-brand-card rounded-xl border border-brand-sand/35 shadow-premium flex flex-col md:flex-row overflow-hidden min-h-[550px]"
    >
      {/* Left Side: Brand Display */}
      <div className="flex-1 p-8 md:p-12 flex flex-col justify-center items-center text-center relative border-b md:border-b-0 md:border-r border-brand-sand/30 bg-brand-card">
        <div className="space-y-4">
          <h1 className="font-serif text-5xl md:text-6xl text-brand-dark font-normal tracking-wide">
            Verbum
          </h1>
          <p className="font-sans text-brand-muted text-base tracking-wide max-w-xs">
            Where words find meaning. A workspace for intentional minds.
          </p>
        </div>
      </div>

      {/* Right Side: Form Container */}
      <div className="flex-1 p-8 md:p-12 flex flex-col justify-center bg-brand-card">
        <div className="max-w-[320px] w-full mx-auto space-y-8">
          <h2 className="font-serif text-3xl md:text-4xl text-brand-dark font-normal text-center">
            Sign In
          </h2>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm font-sans px-4 py-3 rounded border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative border-b border-brand-dark/10 focus-within:border-brand-dark transition-all duration-300">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full bg-transparent py-3 text-base text-brand-dark font-sans outline-none placeholder:text-brand-muted placeholder:opacity-60"
                required
              />
            </div>

            <div className="relative border-b border-brand-dark/10 focus-within:border-brand-dark transition-all duration-300">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-transparent py-3 text-base text-brand-dark font-sans outline-none placeholder:text-brand-muted placeholder:opacity-60"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-brand-dark text-brand-card hover:bg-brand-muted hover:shadow-soft font-sans font-semibold tracking-wider text-sm uppercase rounded cursor-pointer transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center font-sans text-sm text-brand-muted">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-brand-dark hover:text-brand-muted font-medium hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <Suspense fallback={
        <div className="w-full max-w-4xl bg-brand-card rounded-xl border border-brand-sand/35 shadow-premium flex items-center justify-center min-h-[550px]">
          <p className="font-sans text-brand-muted">Loading...</p>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}

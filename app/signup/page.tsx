'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function SignupPage() {
  const router = useRouter();
  const { status } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const signupRes = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await signupRes.json();

      if (!signupRes.ok) {
        setError(data.error || 'Failed to register account.');
        setLoading(false);
      } else {
        setSuccess('Account created successfully! Logging in...');
        
        // Auto sign in user after registration
        const authRes = await signIn('credentials', {
          email: email.toLowerCase(),
          password,
          redirect: false,
        });

        if (authRes?.error) {
          setError('Auto sign in failed. Please try logging in manually.');
          setLoading(false);
        } else {
          router.refresh();
          router.push('/dashboard');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
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
          <div className="max-w-[320px] w-full mx-auto space-y-6">
            <h2 className="font-serif text-3xl md:text-4xl text-brand-dark font-normal text-center">
              Sign Up
            </h2>

            {error && (
              <div className="bg-red-50 text-red-700 text-sm font-sans px-4 py-2 rounded border border-red-200">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 text-green-700 text-sm font-sans px-4 py-2 rounded border border-green-200">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative border-b border-brand-dark/10 focus-within:border-brand-dark transition-all duration-300">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full bg-transparent py-2.5 text-base text-brand-dark font-sans outline-none placeholder:text-brand-muted placeholder:opacity-60"
                  required
                />
              </div>

              <div className="relative border-b border-brand-dark/10 focus-within:border-brand-dark transition-all duration-300">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full bg-transparent py-2.5 text-base text-brand-dark font-sans outline-none placeholder:text-brand-muted placeholder:opacity-60"
                  required
                />
              </div>

              <div className="relative border-b border-brand-dark/10 focus-within:border-brand-dark transition-all duration-300">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (min. 6 characters)"
                  className="w-full bg-transparent py-2.5 text-base text-brand-dark font-sans outline-none placeholder:text-brand-muted placeholder:opacity-60"
                  required
                />
              </div>

              <div className="relative border-b border-brand-dark/10 focus-within:border-brand-dark transition-all duration-300">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  className="w-full bg-transparent py-2.5 text-base text-brand-dark font-sans outline-none placeholder:text-brand-muted placeholder:opacity-60"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-brand-dark text-brand-card hover:bg-brand-muted hover:shadow-soft font-sans font-semibold tracking-wider text-sm uppercase rounded cursor-pointer transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>

            <p className="text-center font-sans text-sm text-brand-muted">
              Already have an account?{' '}
              <Link href="/login" className="text-brand-dark hover:text-brand-muted font-medium hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

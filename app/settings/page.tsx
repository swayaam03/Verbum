'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, Save, User, Shield, Sliders, Globe } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();

  // Settings states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [twitter, setTwitter] = useState('');
  const [github, setGithub] = useState('');
  const [website, setWebsite] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);

  // Status states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;

    const loadProfile = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/profile');
        const data = await res.json();
        if (res.ok && data.success) {
          const u = data.user;
          setName(u.name || '');
          setEmail(u.email || '');
          setBio(u.bio || '');
          setTwitter(u.socialLinks?.twitter || '');
          setGithub(u.socialLinks?.github || '');
          setWebsite(u.socialLinks?.website || '');
          setDarkMode(u.preferences?.darkMode || false);
          setEmailNotifications(u.preferences?.emailNotifications || true);
        }
      } catch (err) {
        console.error('Failed to load profile settings:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [status]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSaving(true);

    try {
      const payload: any = {
        name,
        email,
        bio,
        socialLinks: { twitter, github, website },
        preferences: { darkMode, emailNotifications },
      };

      if (password) {
        payload.password = password;
      }

      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage('Settings updated successfully!');
        setPassword('');
        setConfirmPassword('');
        
        await update({
          name: data.user.name,
          email: data.user.email,
        });
      } else {
        setError(data.error || 'Failed to save settings.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="animate-spin text-brand-muted" size={32} />
        <span className="font-sans text-brand-muted text-sm">Opening settings...</span>
      </div>
    );
  }

  return (
    <div className="max-w-[800px] mx-auto px-6 py-12 md:py-20 flex flex-col space-y-12">
      {/* Title */}
      <div className="space-y-2 text-center md:text-left">
        <h2 className="font-serif text-4xl md:text-5xl text-brand-dark font-normal">
          Settings
        </h2>
        <p className="font-sans text-brand-muted text-base">
          Manage your personal details, bio, linked socials, and system preferences.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm font-sans px-4 py-3 rounded border border-red-200">
          {error}
        </div>
      )}

      {message && (
        <div className="bg-green-50 text-green-700 text-sm font-sans px-4 py-3 rounded border border-green-200">
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-12">
        {/* Profile Details */}
        <div className="bg-brand-card rounded-lg border border-brand-sand/35 shadow-soft p-6 md:p-8 space-y-6">
          <div className="flex items-center space-x-2 border-b border-brand-sand/20 pb-3">
            <User size={18} className="text-brand-dark" />
            <h3 className="font-serif text-xl text-brand-dark font-normal">Personal Profile</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-sans tracking-widest text-brand-muted uppercase font-semibold">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-brand-bg/50 border border-brand-sand/30 rounded py-2.5 px-3 text-sm text-brand-dark font-sans outline-none focus:border-brand-dark/30 transition-all duration-300"
                required
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-sans tracking-widest text-brand-muted uppercase font-semibold">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-brand-bg/50 border border-brand-sand/30 rounded py-2.5 px-3 text-sm text-brand-dark font-sans outline-none focus:border-brand-dark/30 transition-all duration-300"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-sans tracking-widest text-brand-muted uppercase font-semibold">
              Biography / About Me
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell the community a little bit about yourself, your writing styles, and your inspirations..."
              className="w-full bg-brand-bg/50 border border-brand-sand/30 rounded p-3 text-sm text-brand-dark font-sans outline-none min-h-[120px] resize-none focus:border-brand-dark/30 transition-all duration-300 leading-relaxed"
            />
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-brand-card rounded-lg border border-brand-sand/35 shadow-soft p-6 md:p-8 space-y-6">
          <div className="flex items-center space-x-2 border-b border-brand-sand/20 pb-3">
            <Globe size={18} className="text-brand-dark" />
            <h3 className="font-serif text-xl text-brand-dark font-normal">Social Integrations</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-sans tracking-widest text-brand-muted uppercase font-semibold">
                Twitter URL
              </label>
              <input
                type="text"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                placeholder="https://twitter.com/..."
                className="w-full bg-brand-bg/50 border border-brand-sand/30 rounded py-2.5 px-3 text-sm text-brand-dark font-sans outline-none focus:border-brand-dark/30 transition-all duration-300"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-sans tracking-widest text-brand-muted uppercase font-semibold">
                GitHub URL
              </label>
              <input
                type="text"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full bg-brand-bg/50 border border-brand-sand/30 rounded py-2.5 px-3 text-sm text-brand-dark font-sans outline-none focus:border-brand-dark/30 transition-all duration-300"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-sans tracking-widest text-brand-muted uppercase font-semibold">
                Website URL
              </label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://mysite.com"
                className="w-full bg-brand-bg/50 border border-brand-sand/30 rounded py-2.5 px-3 text-sm text-brand-dark font-sans outline-none focus:border-brand-dark/30 transition-all duration-300"
              />
            </div>
          </div>
        </div>

        {/* Security Password */}
        <div className="bg-brand-card rounded-lg border border-brand-sand/35 shadow-soft p-6 md:p-8 space-y-6">
          <div className="flex items-center space-x-2 border-b border-brand-sand/20 pb-3">
            <Shield size={18} className="text-brand-dark" />
            <h3 className="font-serif text-xl text-brand-dark font-normal">Account Security</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-sans tracking-widest text-brand-muted uppercase font-semibold">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current"
                className="w-full bg-brand-bg/50 border border-brand-sand/30 rounded py-2.5 px-3 text-sm text-brand-dark font-sans outline-none focus:border-brand-dark/30 transition-all duration-300"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-sans tracking-widest text-brand-muted uppercase font-semibold">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Leave blank to keep current"
                className="w-full bg-brand-bg/50 border border-brand-sand/30 rounded py-2.5 px-3 text-sm text-brand-dark font-sans outline-none focus:border-brand-dark/30 transition-all duration-300"
              />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-brand-card rounded-lg border border-brand-sand/35 shadow-soft p-6 md:p-8 space-y-6">
          <div className="flex items-center space-x-2 border-b border-brand-sand/20 pb-3">
            <Sliders size={18} className="text-brand-dark" />
            <h3 className="font-serif text-xl text-brand-dark font-normal">Platform Preferences</h3>
          </div>

          <div className="flex flex-col space-y-4">
            <label className="flex items-center space-x-3 cursor-pointer font-sans text-sm text-brand-dark">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
                className="w-4 h-4 rounded text-brand-dark border-brand-sand bg-brand-bg focus:ring-0 cursor-pointer"
              />
              <span className="font-medium select-none">
                Enable Editorial Dark Palette (Vesper Theme)
              </span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer font-sans text-sm text-brand-dark">
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="w-4 h-4 rounded text-brand-dark border-brand-sand bg-brand-bg focus:ring-0 cursor-pointer"
              />
              <span className="font-medium select-none">
                Receive weekly dispatch summaries and community digest emails
              </span>
            </label>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 px-8 py-4 bg-brand-dark text-brand-card hover:bg-brand-muted hover:shadow-soft text-sm font-semibold tracking-wider uppercase rounded transition-all duration-300 cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}

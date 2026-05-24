'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { Menu, X, LogOut, User as UserIcon, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const navLinks = session
    ? [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'My Articles', href: '/my-articles' },
        { name: 'Create', href: '/create-article' },
        { name: 'Library', href: '/library' },
        { name: 'News', href: '/news' },
      ]
    : [
        { name: 'Explore', href: '/articles' },
        { name: 'News', href: '/news' },
      ];

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <header className="relative bg-brand-card shadow-lighter border-b border-brand-sand/30 z-50">
      <div className="max-w-[1160px] mx-auto px-6 md:px-12 py-5 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="logo group">
          <h1 className="font-serif text-3xl md:text-[2.2rem] font-normal text-brand-dark tracking-wide transition-all duration-300 group-hover:opacity-85">
            Verbum
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`font-sans font-medium text-[0.95rem] tracking-wide transition-all duration-300 ${
                pathname === link.href
                  ? 'text-brand-dark border-b border-brand-dark'
                  : 'text-brand-nav-link hover:text-brand-dark'
              }`}
            >
              {link.name}
            </Link>
          ))}

          {status === 'authenticated' ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 text-brand-nav-link hover:text-brand-dark focus:outline-none cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-brand-sand flex items-center justify-center font-serif text-brand-dark border border-brand-dark/10">
                  {session.user?.name ? session.user.name[0].toUpperCase() : 'U'}
                </div>
                <span className="font-sans font-medium text-[0.95rem]">{session.user?.name}</span>
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-3 w-48 bg-brand-card shadow-soft rounded border border-brand-sand/50 p-2 flex flex-col space-y-1"
                  >
                    <Link
                      href={`/profile/${(session.user as any).id || ''}`}
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center space-x-2 px-3 py-2 text-sm text-brand-dark hover:bg-brand-bg rounded transition-all duration-200"
                    >
                      <UserIcon size={16} />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center space-x-2 px-3 py-2 text-sm text-brand-dark hover:bg-brand-bg rounded transition-all duration-200"
                    >
                      <Settings size={16} />
                      <span>Settings</span>
                    </Link>
                    <hr className="border-brand-sand/30 my-1" />
                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-2 w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-all duration-200 cursor-pointer"
                    >
                      <LogOut size={16} />
                      <span>Log Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              href="/login"
              className="nav-button bg-brand-dark text-brand-card hover:bg-brand-muted hover:-translate-y-[1px] px-5 py-2 rounded text-sm font-semibold tracking-wider uppercase transition-all duration-300"
            >
              Sign In
            </Link>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          className="md:hidden text-brand-dark focus:outline-none p-1 cursor-pointer"
          aria-label="Toggle navigation"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden absolute top-full left-0 w-full bg-brand-card shadow-soft border-b border-brand-sand/40 overflow-hidden z-40"
          >
            <div className="px-6 py-6 flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`font-sans font-medium text-lg tracking-wide ${
                    pathname === link.href ? 'text-brand-dark' : 'text-brand-nav-link'
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              {status === 'authenticated' ? (
                <>
                  <Link
                    href={`/profile/${(session.user as any).id || ''}`}
                    onClick={() => setIsOpen(false)}
                    className="font-sans font-medium text-lg text-brand-nav-link"
                  >
                    My Profile
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setIsOpen(false)}
                    className="font-sans font-medium text-lg text-brand-nav-link"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleSignOut();
                    }}
                    className="flex items-center space-x-2 text-red-600 font-medium text-lg pt-2 border-t border-brand-sand/20 cursor-pointer"
                  >
                    <LogOut size={18} />
                    <span>Log Out</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="nav-button bg-brand-dark text-brand-card text-center hover:bg-brand-muted py-3 rounded text-sm font-semibold tracking-wider uppercase"
                >
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

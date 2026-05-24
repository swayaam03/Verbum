import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full text-center py-16 mt-24 border-t border-brand-dark/8">
      <div className="max-w-[1160px] mx-auto px-6 md:px-12 flex flex-col items-center justify-center">
        <nav className="flex flex-wrap justify-center gap-6 md:gap-12 mb-8">
          <Link href="/about" className="text-brand-muted hover:text-brand-dark text-[0.95rem] font-sans transition-all duration-300">
            About Verbum
          </Link>
          <Link href="/articles" className="text-brand-muted hover:text-brand-dark text-[0.95rem] font-sans transition-all duration-300">
            Explore Articles
          </Link>
          <Link href="/community" className="text-brand-muted hover:text-brand-dark text-[0.95rem] font-sans transition-all duration-300">
            Join Community
          </Link>
          <Link href="/contact" className="text-brand-muted hover:text-brand-dark text-[0.95rem] font-sans transition-all duration-300">
            Get in Touch
          </Link>
          <Link href="/privacy" className="text-brand-muted hover:text-brand-dark text-[0.95rem] font-sans transition-all duration-300">
            Privacy Policy
          </Link>
        </nav>
        <p className="copyright text-brand-muted text-sm font-sans">
          &copy; {new Date().getFullYear()} Verbum. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

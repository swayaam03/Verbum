import Link from "next/link";

export default function Footer() {
  return (
    <footer>
      <div className="footer-content container">
        <nav className="footer-links">
          <Link href="/">About Verbum</Link>
          <Link href="/articles">Explore Articles</Link>
          <a href="#community">Join Community</a>
          <a href="#contact">Get in Touch</a>
          <a href="#privacy">Privacy Policy</a>
        </nav>
        <p className="copyright">&copy; {new Date().getFullYear()} Verbum. All rights reserved.</p>
      </div>
    </footer>
  );
}

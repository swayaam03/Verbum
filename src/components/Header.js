"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Header() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuActive, setMenuActive] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUser(data.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, [pathname]);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        setUser(null);
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const toggleMenu = () => {
    setMenuActive(!menuActive);
  };

  return (
    <header className="minimal-header">
      <div className="header-top container">
        <div className="logo">
          <Link href="/">
            <h1>Verbum</h1>
          </Link>
        </div>
        <nav className={`main-nav ${menuActive ? "active" : ""}`}>
          <ul>
            <li>
              <Link href="/articles" className={pathname === "/articles" ? "active-nav" : ""}>
                Explore
              </Link>
            </li>
            {loading ? (
              <li style={{ opacity: 0.5 }}>Loading...</li>
            ) : user ? (
              <>
                <li>
                  <Link href="/dashboard" className={pathname === "/dashboard" ? "active-nav" : ""}>
                    My Articles
                  </Link>
                </li>
                <li>
                  <Link href="/library" className={pathname === "/library" ? "active-nav" : ""}>
                    Library
                  </Link>
                </li>
                <li>
                  <Link href="/articles/create" className={pathname === "/articles/create" ? "active-nav" : ""}>
                    Create
                  </Link>
                </li>
                <li>
                  <Link href="/settings" className={pathname === "/settings" ? "active-nav" : ""}>
                    Settings
                  </Link>
                </li>
                <li>
                  <button 
                    onClick={handleLogout} 
                    className="nav-button" 
                    style={{ 
                      background: "var(--color-text)", 
                      border: "none", 
                      cursor: "pointer",
                      fontFamily: "inherit"
                    }}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link href="/login" className={pathname === "/login" ? "active-nav" : ""}>
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="nav-button" style={{ textDecoration: "none" }}>
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
        <button className="menu-toggle" onClick={toggleMenu} aria-label="Toggle navigation">
          &#9776;
        </button>
      </div>
    </header>
  );
}

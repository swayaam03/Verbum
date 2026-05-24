"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        setSuccess("Login successful! Redirecting...");
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 1000);
      } else {
        setError(data.error || "Invalid email or password");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <div className="auth-page-body">
        <div className="auth-page-wrapper">
          <div className="auth-card-unified">
            {/* Left Section - Brand Display */}
            <div className="auth-card-left-section">
              <div className="auth-brand-display">
                <h1>Verbum</h1>
                <p className="tagline">Where words find meaning</p>
              </div>
            </div>

            {/* Right Section - Form Container */}
            <div className="auth-card-right-section">
              <div className="auth-form-container">
                <h2 className="auth-heading">Login</h2>
                
                {error && (
                  <div style={{ color: "red", marginBottom: "20px", fontSize: "0.95em" }}>
                    ❌ {error}
                  </div>
                )}
                {success && (
                  <div style={{ color: "green", marginBottom: "20px", fontSize: "0.95em" }}>
                    ✅ {success}
                  </div>
                )}

                <form className="auth-form" onSubmit={handleSubmit}>
                  <div className="form-group">
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="auth-submit-button"
                    disabled={submitting}
                  >
                    {submitting ? "Logging in..." : "Login"}
                  </button>
                </form>

                <div className="auth-links">
                  <span>Don't have an account? </span>
                  <Link href="/signup" className="dark-link">
                    Sign Up
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

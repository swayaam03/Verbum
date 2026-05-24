"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password, confirmPassword }),
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        setSuccess("Account created successfully! Redirecting...");
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 1000);
      } else {
        setError(data.error || "Failed to create account");
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
                <h2 className="auth-heading">Sign Up</h2>
                
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
                      type="text"
                      placeholder="Full Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
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
                  <div className="form-group">
                    <input
                      type="password"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="auth-submit-button"
                    disabled={submitting}
                  >
                    {submitting ? "Creating Account..." : "Sign Up"}
                  </button>
                </form>

                <div className="auth-links">
                  <span>Already have an account? </span>
                  <Link href="/login" className="dark-link">
                    Login
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

"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // 1. Verify Authentication & Get Current User
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      
      if (!meRes.ok || !meData.success) {
        router.push("/login");
        return;
      }
      
      setUser(meData.user);

      // 2. Fetch User's Specific Articles
      const artRes = await fetch(`/api/articles?userId=${meData.user.id}`);
      const artData = await artRes.json();
      
      if (artRes.ok && artData.success) {
        setArticles(artData.articles);
      } else {
        setError(artData.error || "Failed to load your articles");
      }
    } catch (err) {
      setError("An unexpected error occurred loading your dashboard.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleDelete = async (articleId, title) => {
    if (!confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/articles/${articleId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        alert("Article deleted successfully!");
        setArticles((prev) => prev.filter((a) => a.id !== articleId));
      } else {
        alert(data.error || "Failed to delete article");
      }
    } catch (err) {
      alert("Error deleting article. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      <Header />
      
      <main className="articles-homepage-section" style={{ minHeight: "70vh" }}>
        <div className="container">
          {loading ? (
            <p className="no-articles">Loading your dashboard...</p>
          ) : error ? (
            <div className="no-articles">
              <h3>Error Accessing Dashboard</h3>
              <p>{error}</p>
              <button onClick={loadDashboardData} className="button" style={{ marginTop: "15px" }}>
                Retry
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", borderBottom: "1px solid rgba(45, 45, 45, 0.08)", paddingBottom: "15px" }}>
                <div>
                  <h2 style={{ margin: 0, textAlign: "left", fontFamily: "'DM Serif Display', serif" }}>
                    My Articles
                  </h2>
                  <p style={{ margin: "5px 0 0 0", color: "var(--color-muted)" }}>
                    Welcome back, {user.fullName}. You have published {articles.length} articles.
                  </p>
                </div>
                <Link href="/articles/create" className="button" style={{ fontSize: "0.95em", padding: "12px 25px", textDecoration: "none" }}>
                  Create Article
                </Link>
              </div>

              {articles.length === 0 ? (
                <div className="no-articles" style={{ padding: "80px 20px" }}>
                  <h3>You haven't written any articles yet</h3>
                  <p>Start your creative writing journey now.</p>
                  <Link href="/articles/create" className="button" style={{ marginTop: "15px", display: "inline-block" }}>
                    Create Your First Article
                  </Link>
                </div>
              ) : (
                <div className="homepage-article-list">
                  {articles.map((article) => (
                    <article className="homepage-article-item" key={article.id}>
                      <div>
                        {article.image_path ? (
                          <img 
                            src={article.image_path} 
                            alt={article.title} 
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&auto=format&fit=crop&q=60";
                            }}
                          />
                        ) : (
                          <img 
                            src="https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&auto=format&fit=crop&q=60" 
                            alt="Cover Placeholder" 
                          />
                        )}
                        <h3>{article.title}</h3>
                        <p className="meta">Published on {formatDate(article.created_at)}</p>
                        <p className="content-snippet">{article.content_preview}</p>
                      </div>

                      <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                        <Link 
                          href={`/articles/${article.id}`} 
                          className="button"
                          style={{ 
                            padding: "8px 15px", 
                            fontSize: "0.85em", 
                            flex: 1, 
                            textAlign: "center",
                            textDecoration: "none"
                          }}
                        >
                          View
                        </Link>
                        <Link 
                          href={`/articles/${article.id}/edit`} 
                          className="button"
                          style={{ 
                            padding: "8px 15px", 
                            fontSize: "0.85em", 
                            backgroundColor: "transparent",
                            color: "var(--color-text)",
                            border: "1px solid var(--color-text)",
                            boxShadow: "none",
                            flex: 1,
                            textAlign: "center",
                            textDecoration: "none"
                          }}
                        >
                          Edit
                        </Link>
                        <button 
                          onClick={() => handleDelete(article.id, article.title)}
                          className="button"
                          style={{ 
                            padding: "8px 15px", 
                            fontSize: "0.85em", 
                            backgroundColor: "#8b0000",
                            color: "#fff",
                            boxShadow: "none",
                            flex: 1
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

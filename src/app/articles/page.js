"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState("");

  const fetchArticles = useCallback(async (pageNum) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/articles?page=${pageNum}&limit=6`);
      const data = await res.json();
      
      if (res.ok && data.success) {
        setArticles(data.articles);
        setPage(data.pagination.current_page);
        setTotalPages(data.pagination.total_pages);
      } else {
        setError(data.error || "Failed to load articles");
      }
    } catch (err) {
      setError("Error loading articles. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles(page);
  }, [page, fetchArticles]);

  const handleSaveToLibrary = (article) => {
    // Legacy saved reads simulation via localStorage
    try {
      const existing = JSON.parse(localStorage.getItem("verbum_library") || "[]");
      const alreadySaved = existing.some((item) => item.id === article.id);
      
      if (alreadySaved) {
        alert("This article is already in your library!");
        return;
      }

      existing.push({
        ...article,
        savedAt: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      });
      localStorage.setItem("verbum_library", JSON.stringify(existing));
      alert("Article saved to your library successfully!");
    } catch (e) {
      alert("Failed to save article to library.");
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
          <h2 style={{ marginBottom: "10px" }}>Latest Articles</h2>
          <p style={{ textAlign: "center", color: "var(--color-muted)", marginBottom: "40px", fontSize: "1.1em" }}>
            Explore reflections, stories, and expressions from the Verbum writing community.
          </p>

          {loading ? (
            <p className="no-articles">Loading articles...</p>
          ) : error ? (
            <div className="no-articles">
              <h3>Error Loading Feed</h3>
              <p>{error}</p>
              <button 
                onClick={() => fetchArticles(page)} 
                className="button" 
                style={{ marginTop: "15px", padding: "10px 20px", fontSize: "0.95em" }}
              >
                Retry
              </button>
            </div>
          ) : articles.length === 0 ? (
            <div className="no-articles">
              <h3>No Articles Yet</h3>
              <p>Be the first to share your inner world with the community.</p>
              <Link href="/articles/create" className="button" style={{ marginTop: "15px" }}>
                Create Article
              </Link>
            </div>
          ) : (
            <>
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
                      <p className="meta">
                        By {article.author} on {formatDate(article.created_at)}
                      </p>
                      <p className="content-snippet">{article.content_preview}</p>
                    </div>

                    <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                      <Link 
                        href={`/articles/${article.id}`} 
                        className="button"
                        style={{ 
                          padding: "10px 20px", 
                          fontSize: "0.9em", 
                          flex: 1, 
                          textAlign: "center",
                          textDecoration: "none"
                        }}
                      >
                        Read More
                      </Link>
                      <button 
                        onClick={() => handleSaveToLibrary(article)}
                        className="button"
                        style={{ 
                          padding: "10px 20px", 
                          fontSize: "0.9em", 
                          backgroundColor: "transparent",
                          color: "var(--color-text)",
                          border: "1px solid var(--color-text)",
                          boxShadow: "none",
                          flex: 1
                        }}
                      >
                        Save
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "40px" }}>
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="button"
                    style={{ 
                      padding: "10px 20px", 
                      fontSize: "0.95em", 
                      opacity: page === 1 ? 0.5 : 1, 
                      cursor: page === 1 ? "not-allowed" : "pointer" 
                    }}
                  >
                    Previous
                  </button>
                  <span style={{ alignSelf: "center", fontWeight: "600" }}>
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="button"
                    style={{ 
                      padding: "10px 20px", 
                      fontSize: "0.95em", 
                      opacity: page === totalPages ? 0.5 : 1, 
                      cursor: page === totalPages ? "not-allowed" : "pointer" 
                    }}
                  >
                    Next
                  </button>
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

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function LibraryPage() {
  const [savedArticles, setSavedArticles] = useState([]);
  const [likes, setLikes] = useState({});

  useEffect(() => {
    // Load Saved Articles from LocalStorage
    const stored = JSON.parse(localStorage.getItem("verbum_library") || "[]");
    setSavedArticles(stored);
    
    // Initialize likes mock state
    const initialLikes = {};
    stored.forEach((art) => {
      initialLikes[art.id] = Math.floor(Math.random() * 15); // Random baseline likes
    });
    setLikes(initialLikes);
  }, []);

  const handleUnsave = (articleId) => {
    const updated = savedArticles.filter((art) => art.id !== articleId);
    setSavedArticles(updated);
    localStorage.setItem("verbum_library", JSON.stringify(updated));
    alert("Article removed from your library.");
  };

  const handleLike = (articleId) => {
    setLikes((prev) => ({
      ...prev,
      [articleId]: (prev[articleId] || 0) + 1,
    }));
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
      
      <main className="library-main-content" style={{ minHeight: "75vh", paddingTop: "50px" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h2 className="library-page-heading" style={{ fontFamily: "'DM Serif Display', serif", fontSize: "2.8em", margin: "0 0 10px 0" }}>
              My Library
            </h2>
            <p className="library-subheading" style={{ color: "var(--color-muted)", fontSize: "1.1em" }}>
              Your saved reads, all in one place.
            </p>
          </div>

          {savedArticles.length === 0 ? (
            <div className="no-articles" style={{ padding: "80px 20px" }}>
              <h3>Your library is empty</h3>
              <p>Articles you bookmark while browsing will appear here.</p>
              <Link href="/articles" className="button" style={{ marginTop: "15px", display: "inline-block" }}>
                Browse Articles
              </Link>
            </div>
          ) : (
            <div className="library-articles-grid">
              {savedArticles.map((article) => (
                <article className="library-article-card" key={article.id}>
                  <div className="article-card-image-wrapper">
                    {article.image_path ? (
                      <img 
                        src={article.image_path} 
                        alt={article.title} 
                        className="library-article-card-image"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&auto=format&fit=crop&q=60";
                        }}
                      />
                    ) : (
                      <img 
                        src="https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&auto=format&fit=crop&q=60" 
                        alt="Cover Placeholder" 
                        className="library-article-card-image"
                      />
                    )}
                    <div className="article-actions-overlay">
                      <button 
                        onClick={() => handleUnsave(article.id)}
                        className="save-article-button saved" 
                        aria-label="Remove from Library"
                        style={{ border: "none", cursor: "pointer" }}
                      >
                        <svg className="icon-save-filled" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleUnsave(article.id)}
                        className="remove-from-library-button" 
                        aria-label="Remove from Library Permanently"
                        style={{ border: "none", cursor: "pointer" }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="library-article-card-content">
                    <h3 className="library-article-card-title">
                      <Link href={`/articles/${article.id}`}>
                        {article.title}
                      </Link>
                    </h3>
                    <p className="library-article-card-author">By {article.author}</p>
                    <p className="library-article-card-preview">{article.content_preview}</p>
                    <p className="library-article-card-date">
                      Published: {formatDate(article.created_at)}
                    </p>
                    <div className="article-card-interactions">
                      <button 
                        onClick={() => handleLike(article.id)}
                        className="like-article-button" 
                        aria-label="Like Article"
                        style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}
                      >
                        <span className="like-icon" style={{ display: "flex", alignItems: "center" }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "red" }}>
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                          </svg>
                        </span>
                        <span className="like-count">{likes[article.id] || 0}</span>
                      </button>
                      <Link href={`/articles/${article.id}`} className="comments-link" style={{ textDecoration: "none" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "4px" }}>
                          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                        </svg>
                        Comments (0)
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

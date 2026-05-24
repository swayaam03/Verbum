"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ViewArticlePage({ params }) {
  const { id } = use(params);
  
  const [article, setArticle] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const router = useRouter();

  useEffect(() => {
    // 1. Fetch current logged-in user (to show Edit button if owner)
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});

    // 2. Fetch Article Details
    fetch(`/api/articles/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.article) {
          setArticle(data.article);
        } else {
          setError(data.error || "Article not found");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Error loading article details.");
        setLoading(false);
      });
  }, [id]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <>
      <Header />
      
      <main style={{ minHeight: "75vh", padding: "40px 0" }}>
        <div className="container" style={{ maxWidth: "850px" }}>
          {loading ? (
            <p style={{ textAlign: "center", padding: "50px" }}>Loading article content...</p>
          ) : error ? (
            <div className="no-articles">
              <h3>Error Viewing Article</h3>
              <p>{error}</p>
              <Link href="/articles" className="button" style={{ marginTop: "15px" }}>
                Back to Feed
              </Link>
            </div>
          ) : (
            <article style={{ display: "flex", flexDirection: "column" }}>
              {/* Edit Option for Author */}
              {currentUser && currentUser.id === article.user_id && (
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
                  <Link 
                    href={`/articles/${article.id}/edit`} 
                    className="button"
                    style={{ padding: "10px 25px", fontSize: "0.9em", textDecoration: "none" }}
                  >
                    Edit Article
                  </Link>
                </div>
              )}

              {/* Cover Image */}
              {article.image_path ? (
                <div style={{ width: "100%", height: "450px", overflow: "hidden", borderRadius: "10px", boxShadow: "var(--soft-shadow)", marginBottom: "40px" }}>
                  <img 
                    src={article.image_path} 
                    alt={article.title} 
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&auto=format&fit=crop&q=80";
                    }}
                  />
                </div>
              ) : (
                <div style={{ width: "100%", height: "350px", overflow: "hidden", borderRadius: "10px", boxShadow: "var(--soft-shadow)", marginBottom: "40px" }}>
                  <img 
                    src="https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&auto=format&fit=crop&q=80" 
                    alt="Cover Placeholder" 
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
              )}

              {/* Title & Metadata */}
              <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "3.5em", color: "var(--color-text)", margin: "0 0 15px 0", lineHeight: "1.1", fontWeight: "400" }}>
                {article.title}
              </h1>
              
              <p style={{ color: "var(--color-muted)", fontSize: "1.05em", borderBottom: "1px solid rgba(45, 45, 45, 0.08)", paddingBottom: "25px", marginBottom: "40px" }}>
                By <span style={{ fontWeight: "600", color: "var(--color-text)" }}>{article.author}</span> &bull; {formatDate(article.created_at)}
              </p>

              {/* Article Content Body */}
              <div 
                style={{ 
                  fontSize: "1.25em", 
                  lineHeight: "1.8", 
                  color: "var(--color-text)",
                  fontFamily: "'Inter', sans-serif",
                  whiteSpace: "pre-wrap", 
                  marginBottom: "60px" 
                }}
              >
                {article.content}
              </div>

              {/* Author Biography Box */}
              <section 
                style={{ 
                  backgroundColor: "var(--color-card-background)", 
                  padding: "40px", 
                  borderRadius: "10px", 
                  boxShadow: "var(--soft-shadow)", 
                  border: "1px solid rgba(45,45,45,0.05)",
                  display: "flex",
                  gap: "30px",
                  alignItems: "center",
                  marginTop: "30px",
                  marginBottom: "40px"
                }}
              >
                <div style={{ flexShrink: 0 }}>
                  <img 
                    src={article.user?.profile_image || "https://api.dicebear.com/7.x/initials/svg?seed=" + article.author} 
                    alt={article.author}
                    style={{ width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--color-text)" }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://api.dicebear.com/7.x/initials/svg?seed=" + article.author;
                    }}
                  />
                </div>
                <div style={{ flexGrow: 1 }}>
                  <h4 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.8em", margin: "0 0 10px 0", color: "var(--color-text)", fontWeight: "400" }}>
                    About {article.author}
                  </h4>
                  <p style={{ margin: "0 0 15px 0", color: "var(--color-muted)", fontSize: "1.05em", lineHeight: "1.6" }}>
                    {article.user?.bio || "This author hasn't shared a bio yet, but their words speak volumes."}
                  </p>
                  
                  {/* Social links */}
                  <div style={{ display: "flex", gap: "15px", fontSize: "0.95em", fontWeight: "600" }}>
                    {article.user?.twitter && (
                      <a href={article.user.twitter} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-text)", textDecoration: "none" }}>
                        Twitter ↗
                      </a>
                    )}
                    {article.user?.linkedin && (
                      <a href={article.user.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-text)", textDecoration: "none" }}>
                        LinkedIn ↗
                      </a>
                    )}
                    {article.user?.medium && (
                      <a href={article.user.medium} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-text)", textDecoration: "none" }}>
                        Medium ↗
                      </a>
                    )}
                  </div>
                </div>
              </section>
            </article>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

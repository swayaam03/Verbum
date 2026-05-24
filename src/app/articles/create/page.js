"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function CreateArticlePage() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const router = useRouter();

  useEffect(() => {
    // Verify user is logged in
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setAuthor(data.user.fullName);
          setLoading(false);
        } else {
          router.push("/login");
        }
      })
      .catch(() => {
        router.push("/login");
      });
  }, [router]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e2) => setImagePreview(e2.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setPublishing(true);

    let imagePath = "";

    try {
      // 1. Upload Cover Image if selected
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        
        const uploadData = await uploadRes.json();
        
        if (uploadRes.ok && uploadData.success) {
          imagePath = uploadData.url;
        } else {
          setError(uploadData.error || "Failed to upload cover image");
          setPublishing(false);
          return;
        }
      }

      // 2. Publish Article
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          author,
          content,
          imagePath,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess("Article published successfully!");
        setTimeout(() => {
          router.push(`/articles/${data.article_id}`);
        }, 1000);
      } else {
        setError(data.error || "Failed to publish article");
      }
    } catch (err) {
      setError("An unexpected error occurred while publishing.");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <>
      <Header />
      
      <main className="articles-homepage-section" style={{ minHeight: "75vh", padding: "60px 20px" }}>
        <div className="container" style={{ maxWidth: "750px", backgroundColor: "var(--color-card-background)", padding: "40px", borderRadius: "10px", boxShadow: "var(--soft-shadow)" }}>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "2.5em", marginBottom: "30px", textAlign: "left", color: "var(--color-text)" }}>
            Create New Article
          </h2>

          {loading ? (
            <p>Verifying session details...</p>
          ) : (
            <>
              {error && <div style={{ color: "red", marginBottom: "20px", fontWeight: "600" }}>❌ {error}</div>}
              {success && <div style={{ color: "green", marginBottom: "20px", fontWeight: "600" }}>✅ {success}</div>}

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
                {/* Title */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label htmlFor="articleTitle" style={{ fontWeight: "600", fontSize: "1.1em" }}>Title</label>
                  <input 
                    type="text" 
                    id="articleTitle" 
                    placeholder="Enter a compelling title..." 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    style={{ padding: "12px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: "6px", fontSize: "1.1em", fontFamily: "inherit" }}
                  />
                </div>

                {/* Author Name */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label htmlFor="articleAuthor" style={{ fontWeight: "600", fontSize: "1.1em" }}>Author Name</label>
                  <input 
                    type="text" 
                    id="articleAuthor" 
                    placeholder="Enter author's name (optional)" 
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    style={{ padding: "12px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: "6px", fontSize: "1.1em", fontFamily: "inherit" }}
                  />
                </div>

                {/* Cover Image */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label htmlFor="featureImage" style={{ fontWeight: "600", fontSize: "1.1em" }}>Cover Image</label>
                  <input 
                    type="file" 
                    id="featureImage" 
                    accept="image/*" 
                    onChange={handleImageChange}
                    style={{ fontFamily: "inherit" }}
                  />
                  {imagePreview && (
                    <div style={{ marginTop: "15px" }}>
                      <p style={{ margin: "0 0 8px 0", fontSize: "0.9em", color: "var(--color-muted)" }}>Preview:</p>
                      <img 
                        src={imagePreview} 
                        alt="Cover Preview" 
                        style={{ width: "100%", maxHeight: "300px", objectFit: "cover", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.1)" }}
                      />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label htmlFor="articleContent" style={{ fontWeight: "600", fontSize: "1.1em" }}>Content</label>
                  <textarea 
                    id="articleContent" 
                    rows="12" 
                    placeholder="Pour your thoughts onto the page..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    style={{ padding: "15px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: "6px", fontSize: "1.1em", lineHeight: "1.6", fontFamily: "inherit", resize: "vertical" }}
                  ></textarea>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "15px", marginTop: "10px" }}>
                  <button 
                    type="submit" 
                    className="button"
                    disabled={publishing}
                    style={{ flex: 1, padding: "15px", cursor: publishing ? "not-allowed" : "pointer" }}
                  >
                    {publishing ? "Publishing Story..." : "Publish Article"}
                  </button>
                  <button 
                    type="button"
                    onClick={() => router.back()}
                    className="button"
                    style={{ 
                      flex: 1, 
                      padding: "15px", 
                      backgroundColor: "transparent",
                      color: "var(--color-text)",
                      border: "1px solid var(--color-text)",
                      boxShadow: "none"
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

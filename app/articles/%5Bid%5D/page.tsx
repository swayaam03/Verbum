'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bookmark, Edit, Loader2 } from 'lucide-react';

export default function ArticleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [togglingSave, setTogglingSave] = useState(false);

  useEffect(() => {
    const loadArticleAndLibrary = async () => {
      setLoading(true);
      try {
        // Fetch article
        const articleRes = await fetch(`/api/articles/${id}`);
        const articleData = await articleRes.json();
        
        if (articleRes.ok && articleData.success) {
          setArticle(articleData.article);

          // If logged in, check if article is in user's saved list
          if (session) {
            const libraryRes = await fetch('/api/library');
            const libraryData = await libraryRes.json();
            if (libraryRes.ok && libraryData.success) {
              const savedIds = libraryData.savedArticles.map((item: any) => item._id);
              setIsSaved(savedIds.includes(id));
            }
          }
        } else {
          console.error(articleData.error || 'Failed to load article');
        }
      } catch (err) {
        console.error('Error loading article:', err);
      } finally {
        setLoading(false);
      }
    };

    loadArticleAndLibrary();
  }, [id, session]);

  const handleSaveToggle = async () => {
    if (!session) {
      router.push('/login');
      return;
    }

    setTogglingSave(true);
    try {
      const method = isSaved ? 'DELETE' : 'POST';
      const res = await fetch('/api/library', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId: id }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsSaved(!isSaved);
      }
    } catch (err) {
      console.error('Failed to toggle save:', err);
    } finally {
      setTogglingSave(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="animate-spin text-brand-muted" size={32} />
        <span className="font-sans text-brand-muted text-sm">Opening article...</span>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-md mx-auto my-20 text-center space-y-4">
        <h3 className="font-serif text-3xl text-brand-dark">Article Not Found</h3>
        <p className="font-sans text-brand-muted text-sm">
          The story you are looking for might have been removed or set to draft.
        </p>
        <Link href="/articles" className="inline-block border-b border-brand-dark text-brand-dark font-semibold text-xs tracking-wider uppercase pb-0.5">
          Go back to Explore
        </Link>
      </div>
    );
  }

  const isAuthor = session && (session.user as any).id === article.authorId;
  const formattedDate = new Date(article.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const placeholderImages = [
    'https://images.unsplash.com/photo-1516414447565-b14be0adf13e?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=1200&auto=format&fit=crop',
  ];

  const getDeterministicImage = (idStr: string) => {
    if (article.imagePath) return article.imagePath;
    const sum = idStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return placeholderImages[sum % placeholderImages.length];
  };

  return (
    <article className="max-w-[800px] mx-auto px-6 py-12 md:py-20 flex flex-col space-y-8 md:space-y-12">
      {/* Back & Actions header */}
      <div className="flex items-center justify-between">
        <Link href="/articles" className="flex items-center space-x-2 text-brand-nav-link hover:text-brand-dark transition-colors duration-300 font-sans text-sm font-medium">
          <ArrowLeft size={16} />
          <span>Back to Explore</span>
        </Link>

        <div className="flex items-center space-x-4">
          {session && isAuthor && (
            <Link
              href={`/edit-article/${id}`}
              className="flex items-center space-x-2 px-3 py-1.5 bg-brand-card hover:bg-brand-sand/30 border border-brand-sand/50 rounded text-brand-dark transition-all duration-300 font-sans text-xs font-semibold uppercase tracking-wider cursor-pointer"
            >
              <Edit size={14} />
              <span>Edit</span>
            </Link>
          )}

          <button
            onClick={handleSaveToggle}
            disabled={togglingSave}
            className="flex items-center space-x-2 px-3 py-1.5 bg-brand-card hover:bg-brand-sand/30 border border-brand-sand/50 rounded text-brand-dark transition-all duration-300 font-sans text-xs font-semibold uppercase tracking-wider cursor-pointer disabled:opacity-50"
          >
            <Bookmark size={14} fill={isSaved ? 'currentColor' : 'none'} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Article Header */}
      <div className="text-center space-y-6 max-w-2xl mx-auto">
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-brand-dark font-normal leading-tight">
          {article.title}
        </h1>
        <div className="font-sans text-brand-muted text-sm md:text-base tracking-wide flex justify-center items-center space-x-2">
          <span>By {article.authorName}</span>
          <span>&bull;</span>
          <span>{formattedDate}</span>
          {article.status === 'draft' && (
            <>
              <span>&bull;</span>
              <span className="text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-xs font-semibold">
                Draft
              </span>
            </>
          )}
        </div>
      </div>

      {/* Large Featured Image */}
      <div className="w-full aspect-[21/9] rounded-lg overflow-hidden border border-brand-sand/30 shadow-soft bg-brand-sand/25">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getDeterministicImage(id)}
          alt={article.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = placeholderImages[0];
          }}
        />
      </div>

      {/* Article Content */}
      <div className="font-sans text-brand-dark text-base md:text-lg leading-relaxed space-y-6 md:space-y-8 tracking-wide">
        {article.content.split('\n\n').map((paragraph: string, idx: number) => {
          if (!paragraph.trim()) return null;
          // Check for subheaders
          if (paragraph.startsWith('### ')) {
            return (
              <h3 key={idx} className="font-serif text-2xl md:text-3xl text-brand-dark font-normal pt-4 mt-8 mb-4 border-b border-brand-sand/20 pb-2">
                {paragraph.replace('### ', '')}
              </h3>
            );
          }
          if (paragraph.startsWith('## ')) {
            return (
              <h2 key={idx} className="font-serif text-3xl md:text-4xl text-brand-dark font-normal pt-4 mt-8 mb-4 border-b border-brand-sand/20 pb-2">
                {paragraph.replace('## ', '')}
              </h2>
            );
          }
          if (paragraph.startsWith('# ')) {
            return null; // Ignore duplicate title inside body
          }
          return (
            <p key={idx} className="text-brand-dark leading-relaxed font-light">
              {paragraph}
            </p>
          );
        })}
      </div>
    </article>
  );
}

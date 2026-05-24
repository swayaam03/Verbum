'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Trash2, ExternalLink } from 'lucide-react';
import ArticleCard from '@/components/ArticleCard';

export default function LibraryPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [savedArticles, setSavedArticles] = useState([]);
  const [savedNews, setSavedNews] = useState([]);
  const [activeTab, setActiveTab] = useState<'articles' | 'news'>('articles');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const loadLibrary = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const res = await fetch('/api/library');
      const data = await res.json();
      if (res.ok && data.success) {
        setSavedArticles(data.savedArticles || []);
        setSavedNews(data.savedNews || []);
      }
    } catch (err) {
      console.error('Failed to load library:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      loadLibrary();
    }
  }, [status, session]);

  const handleUnsaveArticle = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/library', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId: id }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSavedArticles((prev) => prev.filter((item: any) => item._id !== id));
      }
    } catch (err) {
      console.error('Failed to unsave article:', err);
    }
  };

  const handleUnsaveNews = async (url: string) => {
    if (!confirm('Remove this news bookmark from your library?')) return;
    try {
      const res = await fetch('/api/library', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newsUrl: url }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSavedNews((prev) => prev.filter((item: any) => item.url !== url));
      }
    } catch (err) {
      console.error('Failed to unsave news:', err);
    }
  };

  if (status === 'loading' || (loading && savedArticles.length === 0 && savedNews.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="animate-spin text-brand-muted" size={32} />
        <span className="font-sans text-brand-muted text-sm">Opening library...</span>
      </div>
    );
  }

  return (
    <div className="max-w-[1160px] mx-auto px-6 md:px-12 py-12 md:py-20 flex flex-col space-y-8 md:space-y-12">
      {/* Header */}
      <div className="space-y-2 text-center md:text-left">
        <h2 className="font-serif text-4xl md:text-5xl text-brand-dark font-normal">
          My Library
        </h2>
        <p className="font-sans text-brand-muted text-base">
          Your saved reads and bookmarked live news articles.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-brand-sand/30">
        <button
          onClick={() => setActiveTab('articles')}
          className={`py-3 px-6 font-sans text-sm font-semibold tracking-wider uppercase border-b-2 transition-all duration-300 cursor-pointer ${
            activeTab === 'articles'
              ? 'border-brand-dark text-brand-dark'
              : 'border-transparent text-brand-nav-link hover:text-brand-dark'
          }`}
        >
          Articles ({savedArticles.length})
        </button>
        <button
          onClick={() => setActiveTab('news')}
          className={`py-3 px-6 font-sans text-sm font-semibold tracking-wider uppercase border-b-2 transition-all duration-300 cursor-pointer ${
            activeTab === 'news'
              ? 'border-brand-dark text-brand-dark'
              : 'border-transparent text-brand-nav-link hover:text-brand-dark'
          }`}
        >
          Saved News ({savedNews.length})
        </button>
      </div>

      {/* Grid Display */}
      {activeTab === 'articles' ? (
        savedArticles.length === 0 ? (
          <div className="text-center py-20 bg-brand-card rounded-lg border border-brand-sand/30 p-8 space-y-4">
            <p className="font-serif text-2xl text-brand-dark">Library Empty</p>
            <p className="font-sans text-brand-muted text-sm max-w-xs mx-auto">
              You haven&apos;t saved any articles from the community yet.
            </p>
            <Link
              href="/articles"
              className="inline-block border-b border-brand-dark text-brand-dark font-semibold text-xs tracking-wider uppercase pb-0.5"
            >
              Explore community articles
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {savedArticles.map((article: any) => (
              <ArticleCard
                key={article._id}
                id={article._id}
                title={article.title}
                authorName={article.authorName}
                content={article.content}
                imagePath={article.imagePath}
                createdAt={article.createdAt}
                showSaveButton={true}
                isSaved={true}
                onSaveToggle={handleUnsaveArticle}
              />
            ))}
          </div>
        )
      ) : savedNews.length === 0 ? (
        <div className="text-center py-20 bg-brand-card rounded-lg border border-brand-sand/30 p-8 space-y-4">
          <p className="font-serif text-2xl text-brand-dark">No Saved News</p>
          <p className="font-sans text-brand-muted text-sm max-w-xs mx-auto">
            Bookmark interesting articles in the live news feed to see them here.
          </p>
          <Link
            href="/news"
            className="inline-block border-b border-brand-dark text-brand-dark font-semibold text-xs tracking-wider uppercase pb-0.5"
          >
            Check live news feed
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {savedNews.map((item: any) => (
            <div
              key={item.url}
              className="bg-brand-card rounded-lg overflow-hidden border border-brand-sand/35 shadow-soft hover:shadow-premium transition-all duration-300 flex flex-col h-full group"
            >
              {/* Image */}
              {item.urlToImage && (
                <div className="h-44 w-full overflow-hidden bg-brand-sand/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.urlToImage}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              )}
              {/* Content */}
              <div className="p-6 flex flex-col flex-grow">
                <span className="text-[10px] font-sans tracking-widest text-brand-muted uppercase mb-2 block">
                  {item.source} &bull; {item.author || 'Editorial'}
                </span>
                <h3 className="font-serif text-lg text-brand-dark font-normal mb-3 line-clamp-2">
                  {item.title}
                </h3>
                <p className="font-sans text-xs text-brand-muted leading-relaxed line-clamp-3 mb-6 flex-grow">
                  {item.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-brand-sand/20 mt-auto">
                  <button
                    onClick={() => handleUnsaveNews(item.url)}
                    className="flex items-center space-x-1.5 text-xs font-sans font-medium text-red-600 hover:text-red-700 cursor-pointer"
                  >
                    <Trash2 size={14} />
                    <span>Remove</span>
                  </button>

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1.5 text-xs font-sans font-semibold tracking-wider uppercase text-brand-dark hover:text-brand-muted"
                  >
                    <span>Read Original</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

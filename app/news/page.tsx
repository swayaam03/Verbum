'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, Bookmark, ExternalLink, Newspaper, Calendar } from 'lucide-react';

interface NewsItem {
  title: string;
  author: string;
  source: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
}

const NEWS_FEED: NewsItem[] = [
  {
    title: 'The Revival of Print in the Digital Age',
    author: 'Clara Vance',
    source: 'LitReview',
    description: 'Why independent print magazines continue to thrive in a screen-dominated society. We explore the sensory appeal of premium paper, intentional typography, and slow reading.',
    url: 'https://verbum-news.com/revival-of-print',
    urlToImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop',
    publishedAt: '2026-05-20T10:00:00Z',
  },
  {
    title: 'Designing Spaces for Mindful Composition',
    author: 'Kenji Sato',
    source: 'Aesop Design',
    description: 'How environmental factors shape our creative output. Architectural studies reveal that minimalist workspaces with warm lighting, wood textures, and generous empty space boost writing concentration.',
    url: 'https://verbum-news.com/spaces-for-mindful-composition',
    urlToImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600&auto=format&fit=crop',
    publishedAt: '2026-05-18T14:30:00Z',
  },
  {
    title: "The Legacy of Joan Didion's Precise Prose",
    author: 'Sarah Miller',
    source: 'The Editorialist',
    description: "A deep dive into the syntax, rhythm, and emotional reserve that defined Joan Didion's legendary essays. Learn how to write with absolute precision and quiet impact.",
    url: 'https://verbum-news.com/didions-precise-prose',
    urlToImage: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=600&auto=format&fit=crop',
    publishedAt: '2026-05-15T09:15:00Z',
  },
  {
    title: 'The Philosophy of Subtraction in Contemporary Art',
    author: 'Marcus Aurel',
    source: 'Art & Thought',
    description: 'What modern writers can learn from minimalist painters like Agnes Martin. We investigate the power of repetition, grid structures, and holding back.',
    url: 'https://verbum-news.com/philosophy-of-subtraction',
    urlToImage: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=600&auto=format&fit=crop',
    publishedAt: '2026-05-12T11:45:00Z',
  },
];

export default function NewsFeedPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [savedNewsUrls, setSavedNewsUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingUrl, setSavingUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadSavedNews = async () => {
      if (!session) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/library');
        const data = await res.json();
        if (res.ok && data.success) {
          const urls = data.savedNews.map((item: any) => item.url);
          setSavedNewsUrls(urls);
        }
      } catch (err) {
        console.error('Failed to load saved news state:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSavedNews();
  }, [session]);

  const handleSaveToggle = async (newsItem: NewsItem) => {
    if (!session) {
      router.push('/login');
      return;
    }

    const isCurrentlySaved = savedNewsUrls.includes(newsItem.url);
    setSavingUrl(newsItem.url);

    try {
      if (isCurrentlySaved) {
        // Unsave
        const res = await fetch('/api/library', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newsUrl: newsItem.url }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setSavedNewsUrls((prev) => prev.filter((url) => url !== newsItem.url));
        }
      } else {
        // Save
        const res = await fetch('/api/library', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newsItem }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setSavedNewsUrls((prev) => [...prev, newsItem.url]);
        }
      }
    } catch (err) {
      console.error('Failed to toggle news save:', err);
    } finally {
      setSavingUrl(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="animate-spin text-brand-muted" size={32} />
        <span className="font-sans text-brand-muted text-sm">Loading live feed...</span>
      </div>
    );
  }

  return (
    <div className="max-w-[1160px] mx-auto px-6 md:px-12 py-12 md:py-20 flex flex-col space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-brand-sand/20 pb-8">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-brand-dark">
            <Newspaper size={18} />
            <span className="text-xs font-sans tracking-widest text-brand-muted uppercase font-semibold">
              Live News Feed
            </span>
          </div>
          <h2 className="font-serif text-4xl md:text-5xl text-brand-dark font-normal">
            Verbum Dispatch
          </h2>
          <p className="font-sans text-brand-muted text-base max-w-md">
            Curated dispatches concerning contemporary writing, print culture, minimalism, and visual composition.
          </p>
        </div>
      </div>

      {/* News Feed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {NEWS_FEED.map((item) => {
          const isSaved = savedNewsUrls.includes(item.url);
          const isToggling = savingUrl === item.url;
          const formattedDate = new Date(item.publishedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });

          return (
            <div
              key={item.url}
              className="bg-brand-card rounded-lg overflow-hidden border border-brand-sand/35 shadow-soft hover:shadow-premium transition-all duration-350 flex flex-col h-full group"
            >
              {/* Image */}
              <div className="h-56 md:h-64 w-full overflow-hidden bg-brand-sand/20 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.urlToImage}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                />
                
                {/* Save button overlay */}
                <button
                  onClick={() => handleSaveToggle(item)}
                  disabled={isToggling}
                  className="absolute top-4 right-4 p-2 bg-brand-card/90 rounded-full shadow-soft hover:bg-brand-card hover:scale-105 text-brand-dark border border-brand-sand/40 transition-all duration-200 cursor-pointer z-10 disabled:opacity-50"
                  aria-label={isSaved ? 'Remove news bookmark' : 'Bookmark news article'}
                >
                  {isToggling ? (
                    <Loader2 size={18} className="animate-spin text-brand-muted" />
                  ) : (
                    <Bookmark size={18} fill={isSaved ? 'currentColor' : 'none'} className={isSaved ? 'text-brand-dark' : 'text-brand-nav-link'} />
                  )}
                </button>
              </div>

              {/* Content */}
              <div className="p-6 md:p-8 flex flex-col flex-grow">
                <div className="flex items-center space-x-2 text-[10px] font-sans tracking-widest text-brand-muted uppercase mb-3">
                  <span>{item.source}</span>
                  <span>&bull;</span>
                  <span>By {item.author}</span>
                </div>

                <h3 className="font-serif text-xl md:text-2xl text-brand-dark font-normal leading-snug mb-4 group-hover:text-brand-muted transition-colors duration-300">
                  {item.title}
                </h3>

                <p className="font-sans text-[0.95rem] text-brand-muted leading-relaxed mb-6 flex-grow">
                  {item.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-brand-sand/20 mt-auto">
                  <div className="flex items-center space-x-1.5 text-brand-muted text-xs font-sans">
                    <Calendar size={14} />
                    <span>{formattedDate}</span>
                  </div>

                  <a
                    href={item.url}
                    onClick={(e) => e.preventDefault()} // Mocking external links in standard UI
                    className="flex items-center space-x-1.5 text-xs font-sans font-semibold tracking-wider uppercase text-brand-dark hover:text-brand-muted"
                  >
                    <span>Read dispatch</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

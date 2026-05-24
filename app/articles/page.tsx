'use client';

import { useEffect, useState } from 'react';
import ArticleCard from '@/components/ArticleCard';
import { Search, Loader2 } from 'lucide-react';

export default function ExploreArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // reset to first page on search
    }, 400);

    return () => clearTimeout(handler);
  }, [search]);

  // Fetch articles on search/page change
  useEffect(() => {
    const loadArticles = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          status: 'published',
          page: page.toString(),
          limit: '6',
          search: debouncedSearch,
        });

        const res = await fetch(`/api/articles?${query.toString()}`);
        const data = await res.json();
        
        if (data.success) {
          setArticles(data.articles);
          setTotalPages(data.pagination.pages);
        }
      } catch (err) {
        console.error('Failed to load articles:', err);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, [debouncedSearch, page]);

  return (
    <div className="max-w-[1160px] mx-auto px-6 md:px-12 py-12 md:py-20 flex flex-col space-y-12">
      {/* Title */}
      <div className="text-center md:text-left space-y-4">
        <h2 className="font-serif text-4xl md:text-5xl text-brand-dark font-normal">
          Explore Articles
        </h2>
        <p className="font-sans text-brand-muted text-base max-w-md">
          Delve into a collection of thoughtful pieces and quiet narratives shared by the Verbum community.
        </p>
      </div>

      {/* Search Input */}
      <div className="max-w-md w-full relative">
        <input
          type="text"
          placeholder="Search by title or author..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-brand-card rounded-lg border border-brand-sand/40 py-3.5 pl-12 pr-4 text-sm text-brand-dark outline-none focus:border-brand-dark/60 shadow-soft font-sans"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" size={18} />
      </div>

      {/* Articles Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="animate-spin text-brand-muted" size={32} />
          <span className="font-sans text-brand-muted text-sm">Curating reads...</span>
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-20 bg-brand-card rounded-lg border border-brand-sand/30 p-8">
          <p className="font-serif text-2xl text-brand-dark mb-2">No Articles Found</p>
          <p className="font-sans text-brand-muted text-sm">
            We couldn&apos;t find any published articles matching your criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article: any) => (
            <ArticleCard
              key={article._id}
              id={article._id}
              title={article.title}
              authorName={article.authorName}
              content={article.content}
              imagePath={article.imagePath}
              createdAt={article.createdAt}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 pt-8 border-t border-brand-sand/20">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-xs font-semibold font-sans uppercase tracking-wider text-brand-dark hover:bg-brand-card border border-brand-sand/40 rounded transition-all duration-300 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <div className="flex items-center space-x-1">
            {Array.from({ length: totalPages }).map((_, idx) => {
              const active = idx + 1 === page;
              return (
                <button
                  key={idx}
                  onClick={() => setPage(idx + 1)}
                  className={`w-8 h-8 text-xs font-semibold font-sans rounded transition-all duration-200 cursor-pointer ${
                    active 
                      ? 'bg-brand-dark text-brand-card' 
                      : 'text-brand-dark hover:bg-brand-card'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 text-xs font-semibold font-sans uppercase tracking-wider text-brand-dark hover:bg-brand-card border border-brand-sand/40 rounded transition-all duration-300 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Plus } from 'lucide-react';
import ArticleCard from '@/components/ArticleCard';

export default function MyArticlesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [articles, setArticles] = useState([]);
  const [activeTab, setActiveTab] = useState<'published' | 'draft'>('published');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const loadArticles = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/articles?authorId=${(session.user as any).id}&status=all`);
      const data = await res.json();
      if (res.ok && data.success) {
        setArticles(data.articles);
      }
    } catch (err) {
      console.error('Failed to fetch user articles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      loadArticles();
    }
  }, [status, session]);

  const handleEdit = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    router.push(`/edit-article/${id}`);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm('Are you sure you want to permanently delete this article?')) return;

    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setArticles((prev) => prev.filter((art: any) => art._id !== id));
        alert('Article deleted successfully!');
      } else {
        alert(data.error || 'Failed to delete article.');
      }
    } catch (err) {
      console.error('Error deleting article:', err);
      alert('An error occurred.');
    }
  };

  if (status === 'loading' || (loading && articles.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="animate-spin text-brand-muted" size={32} />
        <span className="font-sans text-brand-muted text-sm">Loading articles...</span>
      </div>
    );
  }

  const filteredArticles = articles.filter((art: any) => art.status === activeTab);

  return (
    <div className="max-w-[1160px] mx-auto px-6 md:px-12 py-12 md:py-20 flex flex-col space-y-8 md:space-y-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="font-serif text-4xl md:text-5xl text-brand-dark font-normal">
            My Articles
          </h2>
          <p className="font-sans text-brand-muted text-base">
            Manage your drafts, publish stories, and view your stats.
          </p>
        </div>

        <Link
          href="/create-article"
          className="flex items-center space-x-2 px-5 py-3 bg-brand-dark text-brand-card hover:bg-brand-muted hover:shadow-soft rounded text-sm font-semibold tracking-wider uppercase transition-all duration-300 self-start md:self-center cursor-pointer"
        >
          <Plus size={16} />
          <span>New Story</span>
        </Link>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-brand-sand/30">
        <button
          onClick={() => setActiveTab('published')}
          className={`py-3 px-6 font-sans text-sm font-semibold tracking-wider uppercase border-b-2 transition-all duration-300 cursor-pointer ${
            activeTab === 'published'
              ? 'border-brand-dark text-brand-dark'
              : 'border-transparent text-brand-nav-link hover:text-brand-dark'
          }`}
        >
          Published ({articles.filter((art: any) => art.status === 'published').length})
        </button>
        <button
          onClick={() => setActiveTab('draft')}
          className={`py-3 px-6 font-sans text-sm font-semibold tracking-wider uppercase border-b-2 transition-all duration-300 cursor-pointer ${
            activeTab === 'draft'
              ? 'border-brand-dark text-brand-dark'
              : 'border-transparent text-brand-nav-link hover:text-brand-dark'
          }`}
        >
          Drafts ({articles.filter((art: any) => art.status === 'draft').length})
        </button>
      </div>

      {/* Articles Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-brand-muted" size={24} />
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="text-center py-20 bg-brand-card rounded-lg border border-brand-sand/30 p-8 space-y-4">
          <p className="font-serif text-2xl text-brand-dark">No Articles Found</p>
          <p className="font-sans text-brand-muted text-sm max-w-xs mx-auto">
            You don&apos;t have any {activeTab} articles yet. Write some stories to get started.
          </p>
          <Link
            href="/create-article"
            className="inline-block border-b border-brand-dark text-brand-dark font-semibold text-xs tracking-wider uppercase pb-0.5"
          >
            Create your first story
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map((article: any) => (
            <ArticleCard
              key={article._id}
              id={article._id}
              title={article.title}
              authorName={article.authorName}
              content={article.content}
              imagePath={article.imagePath}
              createdAt={article.createdAt}
              showEditDeleteButtons={true}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

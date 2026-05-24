'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Feather, BookOpen, Newspaper, Settings, Loader2, ArrowRight, BookMarked, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [stats, setStats] = useState({ published: 0, drafts: 0, saved: 0 });
  const [recentArticles, setRecentArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;

    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch user articles
        const articlesRes = await fetch(`/api/articles?authorId=${(session.user as any).id}&status=all`);
        const articlesData = await articlesRes.json();

        // Fetch library count
        const libraryRes = await fetch('/api/library');
        const libraryData = await libraryRes.json();

        if (articlesRes.ok && articlesData.success && libraryRes.ok && libraryData.success) {
          const userArticles = articlesData.articles;
          const publishedCount = userArticles.filter((a: any) => a.status === 'published').length;
          const draftsCount = userArticles.filter((a: any) => a.status === 'draft').length;
          
          setStats({
            published: publishedCount,
            drafts: draftsCount,
            saved: (libraryData.savedArticles?.length || 0) + (libraryData.savedNews?.length || 0),
          });

          setRecentArticles(userArticles.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [status, session]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="animate-spin text-brand-muted" size={32} />
        <span className="font-sans text-brand-muted text-sm">Opening workspace...</span>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null; // Redirecting
  }

  const quickActions = [
    {
      title: 'Write a new story',
      description: 'Open the clean editor and compose a new article, assisted by Gemini AI.',
      href: '/create-article',
      icon: <Feather size={20} className="text-brand-dark" />,
    },
    {
      title: 'My Library',
      description: 'Browse your saved articles from the community and bookmarked news feed.',
      href: '/library',
      icon: <BookMarked size={20} className="text-brand-dark" />,
    },
    {
      title: 'Live News',
      description: 'Explore curated news, read summaries, and save topics to your library.',
      href: '/news',
      icon: <Newspaper size={20} className="text-brand-dark" />,
    },
    {
      title: 'Account Settings',
      description: 'Update your profile bio, link socials, change passwords, and preferences.',
      href: '/settings',
      icon: <Settings size={20} className="text-brand-dark" />,
    },
  ];

  return (
    <div className="max-w-[1160px] mx-auto px-6 md:px-12 py-12 md:py-20 flex flex-col space-y-12 md:space-y-16">
      {/* Welcome Header */}
      <div className="space-y-2 text-center md:text-left">
        <span className="text-xs font-sans tracking-widest text-brand-muted uppercase">
          Author Workspace
        </span>
        <h2 className="font-serif text-4xl md:text-5xl text-brand-dark font-normal">
          Welcome back, {session?.user?.name}
        </h2>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-brand-card rounded-lg border border-brand-sand/35 shadow-soft p-6 md:p-8 flex flex-col justify-between min-h-[140px]"
        >
          <span className="text-xs font-sans tracking-widest text-brand-muted uppercase">Published Articles</span>
          <span className="font-serif text-4xl md:text-5xl text-brand-dark font-normal mt-4">{stats.published}</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-brand-card rounded-lg border border-brand-sand/35 shadow-soft p-6 md:p-8 flex flex-col justify-between min-h-[140px]"
        >
          <span className="text-xs font-sans tracking-widest text-brand-muted uppercase">Current Drafts</span>
          <span className="font-serif text-4xl md:text-5xl text-brand-dark font-normal mt-4">{stats.drafts}</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-brand-card rounded-lg border border-brand-sand/35 shadow-soft p-6 md:p-8 flex flex-col justify-between min-h-[140px]"
        >
          <span className="text-xs font-sans tracking-widest text-brand-muted uppercase">Library Collection</span>
          <span className="font-serif text-4xl md:text-5xl text-brand-dark font-normal mt-4">{stats.saved}</span>
        </motion.div>
      </div>

      {/* Main Grid: Quick Actions & Recent Work */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          <h3 className="font-serif text-2xl text-brand-dark font-normal border-b border-brand-sand/20 pb-3">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {quickActions.map((action) => (
              <Link 
                key={action.title} 
                href={action.href}
                className="bg-brand-card rounded-lg border border-brand-sand/35 shadow-soft p-6 flex flex-col space-y-4 hover:shadow-premium hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-brand-bg flex items-center justify-center border border-brand-sand/40">
                  {action.icon}
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif text-lg text-brand-dark font-normal group-hover:text-brand-muted transition-colors duration-300">
                    {action.title}
                  </h4>
                  <p className="font-sans text-xs text-brand-muted leading-relaxed">
                    {action.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Work */}
        <div className="space-y-6 md:space-y-8">
          <div className="flex justify-between items-end border-b border-brand-sand/20 pb-3">
            <h3 className="font-serif text-2xl text-brand-dark font-normal">
              Recent Writing
            </h3>
            <Link 
              href="/my-articles" 
              className="text-xs font-sans font-semibold tracking-wider uppercase text-brand-dark hover:text-brand-muted transition-colors duration-300 flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <div className="flex flex-col space-y-4">
            {recentArticles.length === 0 ? (
              <div className="bg-brand-card border border-brand-sand/30 rounded-lg p-6 text-center space-y-3">
                <p className="font-sans text-xs text-brand-muted leading-relaxed">
                  You haven&apos;t started writing yet. Start your journey with our editor.
                </p>
                <Link 
                  href="/create-article"
                  className="inline-block bg-brand-dark text-brand-card px-4 py-2 rounded text-xs font-sans font-semibold uppercase tracking-wider hover:bg-brand-muted transition-all duration-300"
                >
                  Write Story
                </Link>
              </div>
            ) : (
              recentArticles.map((article: any) => {
                const date = new Date(article.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });
                return (
                  <Link
                    key={article._id}
                    href={article.status === 'published' ? `/articles/${article._id}` : `/create-article?draftId=${article._id}`}
                    className="bg-brand-card border border-brand-sand/35 shadow-soft rounded-lg p-5 flex justify-between items-center hover:shadow-premium hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer"
                  >
                    <div className="space-y-1 pr-4">
                      <h4 className="font-serif text-base text-brand-dark font-normal line-clamp-1 group-hover:text-brand-muted transition-colors duration-300">
                        {article.title}
                      </h4>
                      <p className="font-sans text-[10px] text-brand-muted">
                        {date} &bull; <span className="capitalize">{article.status}</span>
                      </p>
                    </div>
                    {article.status === 'draft' ? (
                      <FileText size={16} className="text-amber-600 flex-shrink-0" />
                    ) : (
                      <BookOpen size={16} className="text-brand-muted flex-shrink-0" />
                    )}
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

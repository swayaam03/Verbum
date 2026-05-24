'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, Globe, ArrowLeft } from 'lucide-react';
import ArticleCard from '@/components/ArticleCard';
import Link from 'next/link';

export default function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [profile, setProfile] = useState<any>(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfileData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/users/${id}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setProfile(data.user);
          setArticles(data.articles);
        }
      } catch (err) {
        console.error('Failed to load public profile:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="animate-spin text-brand-muted" size={32} />
        <span className="font-sans text-brand-muted text-sm">Opening profile...</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto my-20 text-center space-y-4">
        <h3 className="font-serif text-3xl text-brand-dark">Profile Not Found</h3>
        <p className="font-sans text-brand-muted text-sm">
          The user profile you are looking for does not exist.
        </p>
        <Link href="/articles" className="inline-block border-b border-brand-dark text-brand-dark font-semibold text-xs tracking-wider uppercase pb-0.5">
          Go back to Explore
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1160px] mx-auto px-6 md:px-12 py-12 md:py-20 flex flex-col space-y-16">
      {/* Back Button */}
      <Link href="/articles" className="flex items-center space-x-2 text-brand-nav-link hover:text-brand-dark transition-colors duration-300 font-sans text-sm font-medium self-start">
        <ArrowLeft size={16} />
        <span>Explore Articles</span>
      </Link>

      {/* Author Bio Card */}
      <div className="bg-brand-card rounded-lg border border-brand-sand/35 shadow-soft p-8 md:p-16 flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto w-full">
        {/* Avatar */}
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-brand-sand flex items-center justify-center font-serif text-4xl md:text-5xl text-brand-dark border-2 border-brand-dark/10 shadow-soft">
          {profile.name ? profile.name[0].toUpperCase() : 'U'}
        </div>

        {/* Details */}
        <div className="space-y-3 max-w-xl">
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-brand-dark font-normal">
            {profile.name}
          </h2>
          <p className="font-sans text-brand-muted text-sm md:text-base leading-relaxed font-light italic">
            {profile.bio || "This author hasn't written a biography yet."}
          </p>
        </div>

        {/* Social Icons */}
        {profile.socialLinks && (
          <div className="flex items-center space-x-6 text-brand-nav-link">
            {profile.socialLinks.twitter && (
              <a
                href={profile.socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-dark transition-colors duration-200"
                aria-label="Twitter profile"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            )}
            {profile.socialLinks.github && (
              <a
                href={profile.socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-dark transition-colors duration-200"
                aria-label="GitHub profile"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
              </a>
            )}
            {profile.socialLinks.website && (
              <a
                href={profile.socialLinks.website}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-dark transition-colors duration-200"
                aria-label="Personal website"
              >
                <Globe size={20} />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Author Showcase Grid */}
      <div className="space-y-8">
        <h3 className="font-serif text-2xl md:text-3xl text-brand-dark font-normal border-b border-brand-sand/20 pb-3">
          Published Stories
        </h3>

        {articles.length === 0 ? (
          <div className="text-center py-16 bg-brand-card rounded-lg border border-brand-sand/30 p-8">
            <p className="font-serif text-xl text-brand-dark mb-1">No Stories Yet</p>
            <p className="font-sans text-brand-muted text-sm">
              {profile.name} has not published any articles yet.
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
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { Heart, Bookmark, Edit, Trash2, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

export interface ArticleCardProps {
  id: string;
  title: string;
  authorName: string;
  content: string;
  imagePath?: string;
  createdAt: string | Date;
  isSaved?: boolean;
  isLiked?: boolean;
  likeCount?: number;
  commentCount?: number;
  showSaveButton?: boolean;
  showLikeButton?: boolean;
  showEditDeleteButtons?: boolean;
  onSaveToggle?: (id: string, e: React.MouseEvent) => void;
  onLikeToggle?: (id: string, e: React.MouseEvent) => void;
  onDelete?: (id: string, e: React.MouseEvent) => void;
  onEdit?: (id: string, e: React.MouseEvent) => void;
}

export default function ArticleCard({
  id,
  title,
  authorName,
  content,
  imagePath,
  createdAt,
  isSaved = false,
  isLiked = false,
  likeCount = 0,
  commentCount = 0,
  showSaveButton = false,
  showLikeButton = false,
  showEditDeleteButtons = false,
  onSaveToggle,
  onLikeToggle,
  onDelete,
  onEdit,
}: ArticleCardProps) {
  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Extract plain text snippet from possible markdown content
  const getSnippet = (text: string) => {
    const cleanText = text
      .replace(/#+\s+/g, '') // remove headers
      .replace(/\*\*|__/g, '') // remove bold
      .replace(/\*|_/g, '') // remove italics
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1'); // remove links
    return cleanText.length > 180 ? `${cleanText.substring(0, 180)}...` : cleanText;
  };

  const placeholderImages = [
    'https://images.unsplash.com/photo-1516414447565-b14be0adf13e?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=600&auto=format&fit=crop',
  ];

  // Pick an image based on id string sum to keep it deterministic
  const getDeterministicImage = (idStr: string) => {
    if (imagePath) return imagePath;
    const sum = idStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return placeholderImages[sum % placeholderImages.length];
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-brand-card rounded-lg overflow-hidden border border-brand-sand/35 shadow-soft hover:shadow-premium hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full group"
    >
      {/* Image Container */}
      <div className="relative h-48 md:h-52 w-full overflow-hidden bg-brand-sand/20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getDeterministicImage(id)}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = placeholderImages[0];
          }}
        />

        {/* Action Overlay */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Save button overlay */}
        {showSaveButton && onSaveToggle && (
          <button
            onClick={(e) => onSaveToggle(id, e)}
            className="absolute top-4 right-4 p-2 bg-brand-card/90 rounded-full shadow-soft hover:bg-brand-card hover:scale-105 text-brand-dark border border-brand-sand/40 transition-all duration-200 cursor-pointer z-10"
            aria-label={isSaved ? 'Remove from library' : 'Save to library'}
          >
            <Bookmark size={18} fill={isSaved ? 'currentColor' : 'none'} className={isSaved ? 'text-brand-dark' : 'text-brand-nav-link'} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-6 md:p-8 flex flex-col flex-grow">
        <span className="text-xs font-sans tracking-widest text-brand-muted uppercase mb-3 block">
          By {authorName} &bull; {formattedDate}
        </span>

        <h3 className="font-serif text-xl md:text-2xl text-brand-dark font-normal line-clamp-2 leading-snug mb-3 group-hover:text-brand-muted transition-colors duration-300">
          <Link href={`/articles/${id}`} className="hover:underline focus:outline-none">
            {title}
          </Link>
        </h3>

        <p className="font-sans text-[0.95rem] text-brand-muted line-clamp-3 leading-relaxed mb-6 flex-grow">
          {getSnippet(content)}
        </p>

        {/* Interactions & Edit Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-brand-sand/20 mt-auto">
          <div className="flex items-center space-x-6">
            {showLikeButton && onLikeToggle && (
              <button
                onClick={(e) => onLikeToggle(id, e)}
                className="flex items-center space-x-2 text-brand-nav-link hover:text-red-500 transition-colors duration-200 cursor-pointer"
                aria-label="Like article"
              >
                <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} className={isLiked ? 'text-red-500' : ''} />
                <span className="text-xs font-sans font-medium">{likeCount}</span>
              </button>
            )}

            {commentCount > 0 && (
              <div className="flex items-center space-x-2 text-brand-nav-link">
                <MessageSquare size={16} />
                <span className="text-xs font-sans font-medium">{commentCount}</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {showEditDeleteButtons && (
              <>
                {onEdit && (
                  <button
                    onClick={(e) => onEdit(id, e)}
                    className="p-1.5 text-brand-nav-link hover:text-brand-dark hover:bg-brand-bg rounded transition-all duration-200 cursor-pointer"
                    aria-label="Edit article"
                  >
                    <Edit size={16} />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={(e) => onDelete(id, e)}
                    className="p-1.5 text-brand-nav-link hover:text-red-600 hover:bg-red-50 rounded transition-all duration-200 cursor-pointer"
                    aria-label="Delete article"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </>
            )}

            <Link
              href={`/articles/${id}`}
              className="text-xs font-sans font-semibold tracking-wider uppercase text-brand-dark hover:text-brand-muted transition-colors duration-300"
            >
              Read More
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

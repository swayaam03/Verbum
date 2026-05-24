'use client';

import React from 'react';
import ArticleEditor from '@/components/ArticleEditor';

export default function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  return <ArticleEditor articleId={id} />;
}

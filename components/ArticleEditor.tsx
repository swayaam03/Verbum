'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState, useRef, Suspense } from 'react';
import { Feather, Sparkles, Save, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface ArticleEditorProps {
  articleId?: string;
}

function EditorContent({ articleId }: ArticleEditorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  
  // URL draft parameter fallback (if passed to create-article page, e.g. /create-article?draftId=...)
  const queryDraftId = searchParams.get('draftId');
  const activeId = articleId || queryDraftId;

  // Editor states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imagePath, setImagePath] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Gemini AI Panel states
  const [aiMode, setAiMode] = useState<'generate' | 'refine'>('generate');
  const [topicPrompt, setTopicPrompt] = useState('');
  const [refineTarget, setRefineTarget] = useState('');
  const [refineInstruction, setRefineInstruction] = useState('Improve Style');
  const [customInstruction, setCustomInstruction] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const contentRef = useRef<HTMLTextAreaElement>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Load existing article if editing
  useEffect(() => {
    if (!activeId || status !== 'authenticated') return;

    const loadArticle = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/articles/${activeId}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setTitle(data.article.title);
          setContent(data.article.content);
          setImagePath(data.article.imagePath || '');
        } else {
          console.error(data.error || 'Failed to fetch article');
        }
      } catch (err) {
        console.error('Error loading article:', err);
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [activeId, status]);

  // Automatically fill AI refinement target if user selects text in the editor
  const handleTextSelection = () => {
    if (contentRef.current) {
      const start = contentRef.current.selectionStart;
      const end = contentRef.current.selectionEnd;
      if (start !== end) {
        const selectedText = content.substring(start, end);
        setRefineTarget(selectedText);
        setAiMode('refine');
      }
    }
  };

  const handleSaveDraft = async () => {
    if (!title || !content) {
      alert('Please fill in title and content first.');
      return;
    }
    setIsSaving(true);
    try {
      const url = activeId ? `/api/articles/${activeId}` : '/api/articles';
      const method = activeId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, imagePath, status: 'draft' }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert('Draft saved successfully!');
        if (!activeId) {
          router.push(`/create-article?draftId=${data.article._id}`);
        }
      } else {
        alert(data.error || 'Failed to save draft.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!title || !content) {
      alert('Please fill in title and content first.');
      return;
    }
    setIsPublishing(true);
    try {
      const url = activeId ? `/api/articles/${activeId}` : '/api/articles';
      const method = activeId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, imagePath, status: 'published' }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert('Article published successfully!');
        router.push(`/articles/${activeId || data.article._id}`);
      } else {
        alert(data.error || 'Failed to publish.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred.');
    } finally {
      setIsPublishing(false);
    }
  };

  // AI Helpers
  const handleAIGenerate = async () => {
    if (!topicPrompt.trim()) return;
    setAiLoading(true);
    setAiError('');
    setAiResult('');
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate', topic: topicPrompt }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAiResult(data.text);
      } else {
        setAiError(data.error || 'Generation failed');
      }
    } catch (err) {
      setAiError('An error occurred.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAIRefine = async () => {
    const textToRefine = refineTarget.trim() || content.trim();
    if (!textToRefine) {
      setAiError('Write or select content to refine.');
      return;
    }

    const instruction = refineInstruction === 'Custom' ? customInstruction : refineInstruction;
    if (!instruction.trim()) {
      setAiError('Please enter custom instruction.');
      return;
    }

    setAiLoading(true);
    setAiError('');
    setAiResult('');
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'refine', content: textToRefine, instruction }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAiResult(data.text);
      } else {
        setAiError(data.error || 'Refinement failed');
      }
    } catch (err) {
      setAiError('An error occurred.');
    } finally {
      setAiLoading(false);
    }
  };

  const applyAIGeneration = () => {
    const lines = aiResult.split('\n');
    let extractedTitle = title;
    let cleanContent = aiResult;
    
    if (lines[0]?.startsWith('# ')) {
      extractedTitle = lines[0].substring(2).trim();
      cleanContent = lines.slice(1).join('\n').trim();
    }

    setTitle(extractedTitle);
    setContent(cleanContent);
    setAiResult('');
  };

  const applyAIRefine = () => {
    if (refineTarget && contentRef.current) {
      const start = contentRef.current.selectionStart;
      const end = contentRef.current.selectionEnd;
      const newContent = content.substring(0, start) + aiResult + content.substring(end);
      setContent(newContent);
      setRefineTarget('');
    } else {
      setContent(aiResult);
    }
    setAiResult('');
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="animate-spin text-brand-muted" size={32} />
        <span className="font-sans text-brand-muted text-sm">Opening Editor...</span>
      </div>
    );
  }

  return (
    <div className="max-w-[1160px] mx-auto px-6 md:px-12 py-10 flex flex-col space-y-8">
      {/* Editor Header Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brand-sand/20 pb-5">
        <Link href="/dashboard" className="flex items-center space-x-2 text-brand-nav-link hover:text-brand-dark transition-colors duration-300 font-sans text-sm font-medium">
          <ArrowLeft size={16} />
          <span>Dashboard</span>
        </Link>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="flex items-center space-x-2 px-4 py-2 border border-brand-sand/55 bg-brand-card hover:bg-brand-sand/20 text-brand-dark rounded text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span>Save Draft</span>
          </button>
          
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="flex items-center space-x-2 px-5 py-2 bg-brand-dark text-brand-card hover:bg-brand-muted text-xs font-semibold uppercase tracking-wider rounded shadow-soft hover:shadow-premium transition-all duration-300 cursor-pointer disabled:opacity-50"
          >
            {isPublishing ? <Loader2 size={14} className="animate-spin" /> : <Feather size={14} />}
            <span>Publish Article</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Writing Area (Left) & Gemini Sidebar (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Editor Main Writing Area */}
        <div className="lg:col-span-2 space-y-6 bg-brand-card rounded-lg border border-brand-sand/35 shadow-soft p-6 md:p-10">
          {/* Feature Image URL field */}
          <div className="space-y-1">
            <label className="text-[10px] font-sans tracking-widest text-brand-muted uppercase font-semibold">
              Feature Image URL (Optional)
            </label>
            <input
              type="text"
              value={imagePath}
              onChange={(e) => setImagePath(e.target.value)}
              placeholder="Paste Unsplash or external image URL..."
              className="w-full bg-brand-bg/50 border border-brand-sand/30 rounded py-2 px-3 text-xs text-brand-dark font-sans outline-none focus:border-brand-dark/30 transition-all duration-300"
            />
          </div>

          <hr className="border-brand-sand/15" />

          {/* Title Area */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title of your story..."
            className="w-full bg-transparent font-serif text-3xl md:text-5xl text-brand-dark font-normal outline-none border-none placeholder:text-brand-muted placeholder:opacity-50"
          />

          <hr className="border-brand-sand/15" />

          {/* Body content text area */}
          <textarea
            ref={contentRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onMouseUp={handleTextSelection}
            onKeyUp={handleTextSelection}
            placeholder="Write your story here... (Select text to open AI refinement sidebar)"
            className="w-full bg-transparent font-sans text-base md:text-lg text-brand-dark font-light outline-none border-none resize-none min-h-[500px] placeholder:text-brand-muted placeholder:opacity-55 leading-relaxed"
          />
        </div>

        {/* Gemini AI Writing Panel */}
        <div className="space-y-6 bg-brand-card border border-brand-sand/35 shadow-soft rounded-lg p-6 lg:sticky lg:top-5">
          <div className="flex items-center space-x-2 border-b border-brand-sand/20 pb-4">
            <Sparkles size={18} className="text-brand-dark" />
            <h3 className="font-serif text-lg text-brand-dark font-normal">
              Gemini AI Writing Panel
            </h3>
          </div>

          {/* AI Mode Selector */}
          <div className="flex border border-brand-sand/40 rounded overflow-hidden">
            <button
              onClick={() => {
                setAiMode('generate');
                setAiResult('');
                setAiError('');
              }}
              className={`flex-1 py-2 text-[10px] font-semibold uppercase tracking-wider text-center cursor-pointer transition-all duration-300 ${
                aiMode === 'generate'
                  ? 'bg-brand-dark text-brand-card'
                  : 'text-brand-dark hover:bg-brand-bg'
              }`}
            >
              Generate Draft
            </button>
            <button
              onClick={() => {
                setAiMode('refine');
                setAiResult('');
                setAiError('');
              }}
              className={`flex-1 py-2 text-[10px] font-semibold uppercase tracking-wider text-center cursor-pointer transition-all duration-300 ${
                aiMode === 'refine'
                  ? 'bg-brand-dark text-brand-card'
                  : 'text-brand-dark hover:bg-brand-bg'
              }`}
            >
              Refine Prose
            </button>
          </div>

          {/* Generate Draft UI */}
          {aiMode === 'generate' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-sans tracking-widest text-brand-muted uppercase font-semibold">
                  What is your story about?
                </label>
                <textarea
                  value={topicPrompt}
                  onChange={(e) => setTopicPrompt(e.target.value)}
                  placeholder="e.g., A reflection on minimal lifestyle and the peacefulness of forest cabins in autumn..."
                  className="w-full bg-brand-bg/50 border border-brand-sand/35 rounded-lg p-3 text-xs text-brand-dark font-sans outline-none min-h-[100px] resize-none focus:border-brand-dark/30 transition-all duration-300 leading-relaxed"
                />
              </div>

              <button
                onClick={handleAIGenerate}
                disabled={aiLoading || !topicPrompt.trim()}
                className="w-full py-3 bg-brand-dark text-brand-card hover:bg-brand-muted text-xs font-semibold uppercase tracking-wider rounded shadow-soft hover:shadow-premium transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {aiLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Writing draft...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Generate Full Draft</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Refine Prose UI */}
          {aiMode === 'refine' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-sans tracking-widest text-brand-muted uppercase font-semibold">
                  Selected Text to Refine
                </label>
                <textarea
                  value={refineTarget}
                  onChange={(e) => setRefineTarget(e.target.value)}
                  placeholder="Select/highlight text in your article, or paste a section here to refine..."
                  className="w-full bg-brand-bg/50 border border-brand-sand/35 rounded-lg p-3 text-xs text-brand-dark font-sans outline-none min-h-[100px] resize-none focus:border-brand-dark/30 transition-all duration-300 leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-sans tracking-widest text-brand-muted uppercase font-semibold">
                  Select Action
                </label>
                <select
                  value={refineInstruction}
                  onChange={(e) => setRefineInstruction(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-sand/35 rounded p-2.5 text-xs text-brand-dark outline-none font-sans"
                >
                  <option value="Improve Style">Improve Style & Prose</option>
                  <option value="Lengthen Prose">Lengthen & Expand Content</option>
                  <option value="Shorten / Summarize">Shorten & Summarize</option>
                  <option value="Custom">Custom Instruction...</option>
                </select>
              </div>

              {refineInstruction === 'Custom' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-sans tracking-widest text-brand-muted uppercase font-semibold">
                    Custom Prompt
                  </label>
                  <input
                    type="text"
                    value={customInstruction}
                    onChange={(e) => setCustomInstruction(e.target.value)}
                    placeholder="e.g., rewrite in a poetic tone, translate to Spanish..."
                    className="w-full bg-brand-bg/50 border border-brand-sand/35 rounded py-2.5 px-3 text-xs text-brand-dark font-sans outline-none focus:border-brand-dark/30 transition-all duration-300"
                  />
                </div>
              )}

              <button
                onClick={handleAIRefine}
                disabled={aiLoading}
                className="w-full py-3 bg-brand-dark text-brand-card hover:bg-brand-muted text-xs font-semibold uppercase tracking-wider rounded shadow-soft hover:shadow-premium transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {aiLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Refining...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw size={14} />
                    <span>Refine Prose</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* AI Result & Action Panel */}
          {aiError && (
            <div className="bg-red-50 text-red-700 text-xs font-sans px-3 py-2 rounded border border-red-200">
              {aiError}
            </div>
          )}

          {aiResult && (
            <div className="space-y-4 pt-4 border-t border-brand-sand/20">
              <div className="space-y-1">
                <label className="text-[10px] font-sans tracking-widest text-brand-muted uppercase font-semibold">
                  AI Generated Preview
                </label>
                <div className="w-full bg-brand-bg border border-brand-sand/30 rounded-lg p-4 text-xs text-brand-dark font-sans leading-relaxed max-h-[250px] overflow-y-auto whitespace-pre-wrap select-all">
                  {aiResult}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setAiResult('')}
                  className="flex-1 py-2 border border-brand-sand/55 text-brand-dark hover:bg-brand-bg text-[10px] font-semibold uppercase tracking-wider rounded cursor-pointer transition-all duration-200"
                >
                  Discard
                </button>
                <button
                  onClick={aiMode === 'generate' ? applyAIGeneration : applyAIRefine}
                  className="flex-1 py-2 bg-brand-dark text-brand-card hover:bg-brand-muted text-[10px] font-semibold uppercase tracking-wider rounded cursor-pointer transition-all duration-200"
                >
                  Insert / Replace
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ArticleEditor({ articleId }: ArticleEditorProps) {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="animate-spin text-brand-muted" size={32} />
        <span className="font-sans text-brand-muted text-sm">Opening Editor...</span>
      </div>
    }>
      <EditorContent articleId={articleId} />
    </Suspense>
  );
}

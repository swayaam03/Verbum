import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { generateArticleDraft, refineArticleContent } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const body = await req.json();
    const { action, topic, content, instruction } = body;

    if (action === 'generate') {
      if (!topic) {
        return NextResponse.json({ error: 'Topic is required for generation' }, { status: 400 });
      }
      const draft = await generateArticleDraft(topic);
      return NextResponse.json({ success: true, text: draft });
    } 
    
    if (action === 'refine') {
      if (!content || !instruction) {
        return NextResponse.json({ error: 'Content and instruction are required for refinement' }, { status: 400 });
      }
      const refined = await refineArticleContent(content, instruction);
      return NextResponse.json({ success: true, text: refined });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('AI API Route Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import Article from '@/models/Article';

type RouteParams = {
  params: Promise<{ id: string }>;
};

// GET: Fetch a single article's details
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await dbConnect();

    const article = await Article.findById(id);

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    if (article.status === 'draft') {
      const session = await getServerSession(authOptions);
      if (!session || (session.user as any).id !== article.authorId.toString()) {
        return NextResponse.json({ error: 'Unauthorized to view this draft' }, { status: 403 });
      }
    }

    return NextResponse.json({ success: true, article });
  } catch (error) {
    console.error('Fetch Single Article API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch article details' }, { status: 500 });
  }
}

// PUT: Update an article
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const article = await Article.findById(id);

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    if (article.authorId.toString() !== (session.user as any).id) {
      return NextResponse.json({ error: 'Forbidden. You do not own this article.' }, { status: 403 });
    }

    const body = await req.json();
    const { title, content, imagePath, status } = body;

    if (title) article.title = title;
    if (content) article.content = content;
    if (imagePath !== undefined) article.imagePath = imagePath;
    if (status) article.status = status;

    await article.save();

    return NextResponse.json({
      success: true,
      message: 'Article updated successfully!',
      article,
    });
  } catch (error: any) {
    console.error('Update Article API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update article' }, { status: 500 });
  }
}

// DELETE: Delete an article
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const article = await Article.findById(id);

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    if (article.authorId.toString() !== (session.user as any).id) {
      return NextResponse.json({ error: 'Forbidden. You do not own this article.' }, { status: 403 });
    }

    await Article.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Article deleted successfully!',
    });
  } catch (error) {
    console.error('Delete Article API Error:', error);
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
  }
}

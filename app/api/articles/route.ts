import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import Article from '@/models/Article';

// GET: Fetch articles list
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '9');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'published';
    const authorId = searchParams.get('authorId') || '';

    const query: any = {};

    if (status !== 'all') {
      query.status = status;
    }

    if (authorId) {
      query.authorId = authorId;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { authorName: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [articles, total] = await Promise.all([
      Article.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Article.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      articles,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Fetch Articles API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}

// POST: Create a new article
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const { title, content, imagePath, status = 'draft' } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const newArticle = await Article.create({
      title,
      content,
      imagePath,
      status,
      authorId: (session.user as any).id,
      authorName: session.user.name,
    });

    return NextResponse.json({
      success: true,
      message: 'Article created successfully!',
      article: newArticle,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Create Article API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create article' }, { status: 500 });
  }
}

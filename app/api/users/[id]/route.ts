import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Article from '@/models/Article';

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await dbConnect();

    const user = await User.findById(id).select('-password -savedArticles -savedNews -preferences');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch published articles written by this user
    const articles = await Article.find({ authorId: id, status: 'published' }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      user,
      articles,
    });
  } catch (error) {
    console.error('Fetch Public User Error:', error);
    return NextResponse.json({ error: 'Failed to fetch public user details' }, { status: 500 });
  }
}

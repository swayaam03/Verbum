import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Article from '@/models/Article';

// GET: Fetch saved articles & news for the logged-in user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Populate user's savedArticles array
    const user = await User.findById((session.user as any).id)
      .populate('savedArticles')
      .exec();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      savedArticles: user.savedArticles || [],
      savedNews: user.savedNews || [],
    });
  } catch (error) {
    console.error('Fetch Library API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch library items' }, { status: 500 });
  }
}

// POST: Add an article or news item to saved collection
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const { articleId, newsItem } = body;

    const user = await User.findById((session.user as any).id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (articleId) {
      // Save internal platform article
      const article = await Article.findById(articleId);
      if (!article) {
        return NextResponse.json({ error: 'Article not found' }, { status: 404 });
      }

      // Avoid duplicates
      if (user.savedArticles.includes(articleId)) {
        return NextResponse.json({ success: true, message: 'Already saved' });
      }

      user.savedArticles.push(articleId);
      await user.save();
      return NextResponse.json({ success: true, message: 'Article saved to library' });
    } 
    
    if (newsItem) {
      // Save external news item
      // Check duplicate news by url
      const isAlreadySaved = user.savedNews.some((item: any) => item.url === newsItem.url);
      if (isAlreadySaved) {
        return NextResponse.json({ success: true, message: 'Already saved' });
      }

      user.savedNews.push({
        title: newsItem.title,
        author: newsItem.author,
        source: newsItem.source,
        description: newsItem.description,
        url: newsItem.url,
        urlToImage: newsItem.urlToImage,
        publishedAt: newsItem.publishedAt,
        savedAt: new Date(),
      });
      await user.save();
      return NextResponse.json({ success: true, message: 'News article saved to library' });
    }

    return NextResponse.json({ error: 'Provide articleId or newsItem' }, { status: 400 });
  } catch (error: any) {
    console.error('Save to Library API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to save item' }, { status: 500 });
  }
}

// DELETE: Remove an article or news item from saved collection
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const { articleId, newsUrl } = body;

    const user = await User.findById((session.user as any).id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (articleId) {
      // Remove platform article
      user.savedArticles = user.savedArticles.filter(
        (id: any) => id.toString() !== articleId
      );
      await user.save();
      return NextResponse.json({ success: true, message: 'Article removed from library' });
    } 
    
    if (newsUrl) {
      // Remove news article by url
      user.savedNews = user.savedNews.filter(
        (item: any) => item.url !== newsUrl
      );
      await user.save();
      return NextResponse.json({ success: true, message: 'News article removed from library' });
    }

    return NextResponse.json({ error: 'Provide articleId or newsUrl' }, { status: 400 });
  } catch (error) {
    console.error('Remove from Library API Error:', error);
    return NextResponse.json({ error: 'Failed to remove item' }, { status: 500 });
  }
}

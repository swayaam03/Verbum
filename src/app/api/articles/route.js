import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const userId = searchParams.get("userId");
    
    const skip = (page - 1) * limit;

    const where = {};
    if (userId) {
      where.userId = userId;
    }

    const [articles, totalCount] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
      }),
      prisma.article.count({ where }),
    ]);

    // Format matching legacy PHP structure
    const formattedArticles = articles.map(art => ({
      id: art.id,
      title: art.title,
      author: art.author,
      content: art.content,
      content_preview: art.content.length > 180 ? art.content.substring(0, 180) + "..." : art.content,
      image_path: art.imagePath ? art.imagePath : null,
      user_id: art.userId,
      created_at: art.createdAt.toISOString(),
      user: {
        name: art.user.fullName,
        email: art.user.email,
      }
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      articles: formattedArticles,
      pagination: {
        total_items: totalCount,
        total_pages: totalPages,
        current_page: page,
        limit: limit,
      },
    });
  } catch (error) {
    console.error("Fetch articles error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "Not logged in. Please log in first." },
        { status: 401 }
      );
    }

    const { title, author, content, imagePath } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    const article = await prisma.article.create({
      data: {
        title,
        author: author || currentUser.fullName,
        content,
        imagePath: imagePath || null,
        userId: currentUser.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Article published successfully!",
      article_id: article.id,
    });
  } catch (error) {
    console.error("Create article error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const articleId = id;

    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
            bio: true,
            twitter: true,
            linkedin: true,
            medium: true,
            profileImage: true,
          },
        },
      },
    });

    if (!article) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    const formatted = {
      id: article.id,
      title: article.title,
      author: article.author,
      content: article.content,
      image_path: article.imagePath ? article.imagePath : null,
      user_id: article.userId,
      created_at: article.createdAt.toISOString(),
      user: {
        name: article.user.fullName,
        email: article.user.email,
        bio: article.user.bio,
        twitter: article.user.twitter,
        linkedin: article.user.linkedin,
        medium: article.user.medium,
        profile_image: article.user.profileImage,
      }
    };

    return NextResponse.json({
      success: true,
      article: formatted,
    });
  } catch (error) {
    console.error("Get article details error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const articleId = id;
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Not logged in. Please log in first." },
        { status: 401 }
      );
    }

    const existingArticle = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!existingArticle) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    if (existingArticle.userId !== currentUser.id) {
      return NextResponse.json(
        { error: "Unauthorized. You can only edit your own articles." },
        { status: 403 }
      );
    }

    const { title, author, content, imagePath } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    const updated = await prisma.article.update({
      where: { id: articleId },
      data: {
        title,
        author: author || existingArticle.author,
        content,
        imagePath: imagePath !== undefined ? imagePath : existingArticle.imagePath,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Article updated successfully!",
      article: updated,
    });
  } catch (error) {
    console.error("Update article error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const articleId = id;
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Not logged in. Please log in first." },
        { status: 401 }
      );
    }

    const existingArticle = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!existingArticle) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    if (existingArticle.userId !== currentUser.id) {
      return NextResponse.json(
        { error: "Unauthorized. You can only delete your own articles." },
        { status: 403 }
      );
    }

    await prisma.article.delete({
      where: { id: articleId },
    });

    return NextResponse.json({
      success: true,
      message: "Article deleted successfully!",
    });
  } catch (error) {
    console.error("Delete article error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, clearSession } from "@/lib/session";
import bcrypt from "bcryptjs";

export async function PUT(request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "Not logged in. Please log in first." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { fullName, email, bio, twitter, linkedin, medium, profileImage, newPassword, confirmPassword } = body;

    if (!fullName || !email) {
      return NextResponse.json(
        { error: "Full Name and Email Address are required" },
        { status: 400 }
      );
    }

    if (email !== currentUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });
      if (emailExists) {
        return NextResponse.json(
          { error: "Email is already taken by another account" },
          { status: 400 }
        );
      }
    }

    const data = {
      fullName,
      email,
      bio: bio !== undefined ? bio : currentUser.bio,
      twitter: twitter !== undefined ? twitter : currentUser.twitter,
      linkedin: linkedin !== undefined ? linkedin : currentUser.linkedin,
      medium: medium !== undefined ? medium : currentUser.medium,
      profileImage: profileImage !== undefined ? profileImage : currentUser.profileImage,
    };

    if (newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: "New password must be at least 6 characters long" },
          { status: 400 }
        );
      }
      if (newPassword !== confirmPassword) {
        return NextResponse.json(
          { error: "New passwords do not match" },
          { status: 400 }
        );
      }
      data.password = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data,
    });

    return NextResponse.json({
      success: true,
      message: "Settings saved successfully!",
      user: {
        id: updatedUser.id,
        name: updatedUser.fullName,
        email: updatedUser.email,
      },
    });
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "Not logged in" },
        { status: 401 }
      );
    }

    await prisma.user.delete({
      where: { id: currentUser.id },
    });

    await clearSession();

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully!",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Article from '@/models/Article';
import bcrypt from 'bcryptjs';

// GET: Fetch current user profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById((session.user as any).id).select('-password');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Fetch Profile API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

// PUT: Update user profile
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById((session.user as any).id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const { name, email, password, bio, profilePicture, socialLinks, preferences } = body;

    // Update fields
    if (name) user.name = name;
    if (email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
      }
      user.email = email.toLowerCase();
    }

    if (password) {
      if (password.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
      }
      user.password = await bcrypt.hash(password, 10);
    }

    if (bio !== undefined) user.bio = bio;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;
    if (socialLinks) {
      user.socialLinks = {
        twitter: socialLinks.twitter !== undefined ? socialLinks.twitter : user.socialLinks?.twitter || '',
        github: socialLinks.github !== undefined ? socialLinks.github : user.socialLinks?.github || '',
        website: socialLinks.website !== undefined ? socialLinks.website : user.socialLinks?.website || '',
      };
    }
    if (preferences) {
      user.preferences = {
        darkMode: preferences.darkMode !== undefined ? preferences.darkMode : user.preferences?.darkMode || false,
        emailNotifications: preferences.emailNotifications !== undefined ? preferences.emailNotifications : user.preferences?.emailNotifications || true,
      };
    }

    await user.save();

    // Propagate name changes to author articles
    if (name) {
      await Article.updateMany({ authorId: user._id }, { authorName: name });
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        bio: user.bio,
        socialLinks: user.socialLinks,
        preferences: user.preferences,
      },
    });
  } catch (error: any) {
    console.error('Update Profile API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update profile' }, { status: 500 });
  }
}

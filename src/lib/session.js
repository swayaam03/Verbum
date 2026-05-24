import { cookies } from "next/headers";
import { prisma } from "./prisma";

export async function setSession(user) {
  const cookieStore = await cookies();
  const sessionData = JSON.stringify({
    userId: user.id,
    email: user.email,
    fullName: user.fullName,
  });
  const encoded = Buffer.from(sessionData).toString("base64");
  
  cookieStore.set("verbum_session", encoded, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("verbum_session");
  if (!sessionCookie) return null;
  
  try {
    const decoded = Buffer.from(sessionCookie.value, "base64").toString("utf-8");
    return JSON.parse(decoded);
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        bio: true,
        twitter: true,
        linkedin: true,
        medium: true,
        profileImage: true,
      }
    });
    return user;
  } catch (error) {
    return null;
  }
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete("verbum_session");
}

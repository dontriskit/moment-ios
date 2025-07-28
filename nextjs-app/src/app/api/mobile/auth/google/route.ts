import { type NextRequest, NextResponse } from 'next/server';
import { generateAccessToken, generateRefreshToken } from '@/server/auth/jwt';
import { db } from '@/server/db';
import { eq } from 'drizzle-orm';
import { users, accounts } from '@/server/db/schema';

export async function POST(request: NextRequest) {
  try {
    const { idToken, accessToken, email, name, picture } = await request.json();

    if (!idToken || !email) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Verify the Google token (in production, you should verify this with Google)
    // For now, we'll trust the token from the mobile app

    // Check if user exists with this email
    let user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      // Create new user
      const [newUser] = await db.insert(users).values({
        email,
        name: name || null,
        image: picture || null,
        role: 'USER',
        onboardingCompleted: false,
      }).returning();
      
      user = newUser!;

      // Create account link for Google provider
      await db.insert(accounts).values({
        userId: user.id,
        type: 'oauth',
        provider: 'google',
        providerAccountId: email, // In production, use actual Google ID
        access_token: accessToken,
        token_type: 'Bearer',
      });
    } else {
      // Check if Google account is already linked
      const account = await db.query.accounts.findFirst({
        where: (accounts) => 
          eq(accounts.userId, user!.id) && 
          eq(accounts.provider, 'google')
      });

      if (!account) {
        // Link Google account to existing user
        await db.insert(accounts).values({
          userId: user.id,
          type: 'oauth',
          provider: 'google',
          providerAccountId: email,
          access_token: accessToken,
          token_type: 'Bearer',
        });
      }
    }

    // Generate JWT tokens for mobile app
    const jwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      onboardingCompleted: user.onboardingCompleted,
    };

    const token = generateAccessToken(jwtPayload);
    const refreshToken = generateRefreshToken(user.id);

    return NextResponse.json({
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
        onboardingCompleted: user.onboardingCompleted,
      },
    });
  } catch (error) {
    console.error('Google auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
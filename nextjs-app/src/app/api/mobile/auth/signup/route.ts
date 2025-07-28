import { type NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { generateAccessToken, generateRefreshToken } from '@/server/auth/jwt';
import { db } from '@/server/db';
import { eq } from 'drizzle-orm';
import { users } from '@/server/db/schema';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create new user
    const [newUser] = await db.insert(users).values({
      email,
      password: hashedPassword,
      name: name || null,
      role: 'USER',
      onboardingCompleted: false,
    }).returning();

    // Generate JWT tokens
    const jwtPayload = {
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      onboardingCompleted: newUser.onboardingCompleted,
    };

    const token = generateAccessToken(jwtPayload);
    const refreshToken = generateRefreshToken(newUser.id);

    return NextResponse.json({
      token,
      refreshToken,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        image: newUser.image,
        role: newUser.role,
        onboardingCompleted: newUser.onboardingCompleted,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
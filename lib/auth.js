import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secret = process.env.JWT_SECRET || '';

export async function validateToken(token) {
  try {
    const verified = await jwtVerify(token, new TextEncoder().encode(secret));
    return verified.payload;
  } catch (err) {
    throw new Error('Invalid token');
  }
}

export async function validateAdminRoute(request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication token missing' },
        { status: 401 }
      );
    }

    await validateToken(token);
    return null;
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid authentication token' },
      { status: 401 }
    );
  }
}
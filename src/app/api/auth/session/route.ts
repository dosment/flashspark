
import { getFirebaseAdminApp } from '@/lib/firebase-admin';
import { auth } from 'firebase-admin';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const reqBody = (await request.json()) as { idToken: string };
  const idToken = reqBody.idToken;

  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
  
  const adminApp = getFirebaseAdminApp();
  const sessionCookie = await auth(adminApp).createSessionCookie(idToken, { expiresIn });

  cookies().set('__session', sessionCookie, {
    maxAge: expiresIn,
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
  });

  return NextResponse.json({ status: 'success' });
}


export async function DELETE(request: NextRequest) {
  const sessionCookie = cookies().get('__session')?.value;
  if (sessionCookie) {
    const adminApp = getFirebaseAdminApp();
    const decodedClaims = await auth(adminApp).verifySessionCookie(sessionCookie).catch(() => null);

    if (decodedClaims) {
      await auth(adminApp).revokeRefreshTokens(decodedClaims.sub);
    }
  }
  
  cookies().delete('__session');

  return NextResponse.json({ status: 'success' });
}

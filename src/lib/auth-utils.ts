
import 'server-only';
import { cookies } from 'next/headers';
import { getFirebaseAdminApp, getFirestoreAdmin } from './firebase-admin';
import { AppUser } from './types';
import { auth } from 'firebase-admin';

export async function getCurrentUser(): Promise<AppUser | null> {
  const sessionCookie = cookies().get('__session')?.value;
  if (!sessionCookie) {
    return null;
  }

  try {
    const adminApp = getFirebaseAdminApp();
    const decodedIdToken = await auth(adminApp).verifySessionCookie(sessionCookie, true);
    
    const dbAdmin = getFirestoreAdmin();
    const userDoc = await dbAdmin.collection('users').doc(decodedIdToken.uid).get();

    if (userDoc.exists) {
        const userData = userDoc.data();
        return {
            uid: decodedIdToken.uid,
            email: userData?.email,
            role: userData?.role,
            parentId: userData?.parentId
        } as AppUser;
    }
    return null;

  } catch (error) {
    console.error("Failed to verify session cookie or get user:", error);
    // It's good practice to clear a cookie that causes errors.
    cookies().delete('__session');
    return null;
  }
}

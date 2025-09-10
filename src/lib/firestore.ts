
'use server';

import { getFirebaseAdminApp, getFirestoreAdmin } from './firebase-admin';
import { serverTimestamp, FieldValue, Timestamp } from 'firebase-admin/firestore';
import type { Quiz, AppUser, QuizAttempt, UserAchievement, Role } from './types';
import { Roles } from './types';
import { auth as adminAuth } from 'firebase-admin';

const db = getFirestoreAdmin();
const auth = adminAuth(getFirebaseAdminApp());

/**
 * Creates a new user in both Firebase Auth and Firestore.
 */
export async function createUser(userData: Partial<AppUser> & { email: string, role: Role }): Promise<AppUser> {
    console.log(`[DB] createUser: Attempting to create user for email: ${userData.email}`);
    const authUser = await auth.createUser({
        email: userData.email,
        emailVerified: true,
        displayName: userData.name,
    });
    console.log(`[DB] createUser: Auth user created, UID: ${authUser.uid}`);

    const newUser: AppUser = {
        uid: authUser.uid,
        email: userData.email.toLowerCase(),
        role: userData.role,
        avatarId: userData.avatarId || 'avatar-1',
        name: userData.name || userData.email,
        parentIds: userData.parentIds || [],
    };

    await db.collection('users').doc(authUser.uid).set(newUser);
    console.log(`[DB] createUser: Firestore profile for ${authUser.uid} created.`);
    return newUser;
}

/**
 * Updates a user's data in both Firebase Auth (if needed) and Firestore.
 */
export async function updateUser(uid: string, data: Partial<AppUser>): Promise<AppUser> {
    console.log(`[DB] updateUser: Updating profile for UID ${uid} with data:`, data);
    const userDocRef = db.collection('users').doc(uid);
    
    const authUpdateData: { email?: string, displayName?: string } = {};

    // If email is being updated, it must also be updated in Firebase Auth.
    if (data.email) {
        const authUser = await auth.getUser(uid);
        if (data.email.toLowerCase() !== authUser.email) {
            authUpdateData.email = data.email;
            data.email = data.email.toLowerCase();
        }
    }
    
    if (data.name) {
         const authUser = await auth.getUser(uid);
        if (data.name !== authUser.displayName) {
            authUpdateData.displayName = data.name;
        }
    }

    if (Object.keys(authUpdateData).length > 0) {
        console.log(`[DB] updateUser: Updating Firebase Auth for ${uid}.`);
        await auth.updateUser(uid, authUpdateData);
    }

    await userDocRef.update(data);
    console.log(`[DB] updateUser: Firestore profile updated for ${uid}.`);
    const updatedDoc = await userDocRef.get();
    return { uid, ...updatedDoc.data() } as AppUser;
}

/**
 * Retrieves a user by their email from Firestore.
 */
export async function getUserByEmail(email: string): Promise<AppUser | null> {
    console.log(`[DB] getUserByEmail: Searching for user with email ${email}.`);
    const q = db.collection('users').where('email', '==', email.toLowerCase());
    const querySnapshot = await q.get();
    if (querySnapshot.empty) {
        console.log(`[DB] getUserByEmail: No user found for email ${email}.`);
        return null;
    }
    const userDoc = querySnapshot.docs[0];
    return { uid: userDoc.id, ...userDoc.data() } as AppUser;
}

/**
 * Fetches all users from Firestore. Intended for admin use.
 */
export async function getAllUsers(): Promise<AppUser[]> {
    console.log('[DB] getAllUsers: Fetching all users.');
    const snapshot = await db.collection('users').get();
    return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as AppUser));
}

/**
 * Fetches all users who have a specific parentId in their parentIds array.
 */
export async function getManagedUsers(parentId: string): Promise<AppUser[]> {
    console.log(`[DB] getManagedUsers: Fetching children for parent ${parentId}.`);
    const q = db.collection('users').where('parentIds', 'array-contains', parentId);
    const querySnapshot = await q.get();
    return querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as AppUser));
}

/**
 * Saves a new quiz to Firestore.
 */
export async function saveQuiz(quizData: Omit<Quiz, 'id' | 'createdAt'>): Promise<string> {
  console.log(`[DB] saveQuiz: Saving quiz "${quizData.title}" for user ${quizData.userId}.`);
  const quizCollection = db.collection('quizzes');
  const newQuiz = { ...quizData, createdAt: serverTimestamp() as FieldValue };
  const docRef = await quizCollection.add(newQuiz);
  return docRef.id;
}

/**
 * Gets all quizzes for a specific user, or all quizzes if no ID is given.
 */
export async function getQuizzes(userId?: string): Promise<Quiz[]> {
  console.log(`[DB] getQuizzes: Fetching quizzes for user ${userId || 'ALL'}.`);
  let q = db.collection('quizzes').orderBy('createdAt', 'desc');
  if (userId) {
      q = q.where('userId', '==', userId);
  }
  
  const snapshot = await q.get();
  return snapshot.docs.map(doc => {
    const data = doc.data();
    const ts = data.createdAt as Timestamp;
    return { id: doc.id, ...data, createdAt: { seconds: ts.seconds, nanoseconds: ts.nanoseconds } } as Quiz;
  });
}

/**
 * Gets a single quiz by its ID.
 */
export async function getQuiz(quizId: string): Promise<Quiz | null> {
    console.log(`[DB] getQuiz: Fetching quiz with ID ${quizId}.`);
    const doc = await db.collection('quizzes').doc(quizId).get();
    if (!doc.exists) return null;
    const data = doc.data()!;
    const ts = data.createdAt as Timestamp;
    return { id: doc.id, ...data, createdAt: { seconds: ts.seconds, nanoseconds: ts.nanoseconds } } as Quiz;
}

/**
 * Gets all quiz attempts for a specific user.
 */
export async function getQuizAttempts(userId: string): Promise<QuizAttempt[]> {
    console.log(`[DB] getQuizAttempts: Fetching attempts for user ${userId}.`);
    const q = db.collection('quizAttempts').where('userId', '==', userId).orderBy('completedAt', 'desc');
    const snapshot = await q.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QuizAttempt));
}

/**
 * Saves a new quiz attempt to Firestore.
 */
export async function saveQuizAttempt(attemptData: Omit<QuizAttempt, 'id' | 'completedAt'>): Promise<string> {
    console.log(`[DB] saveQuizAttempt: Saving attempt for user ${attemptData.userId}.`);
    const newAttempt = { ...attemptData, completedAt: serverTimestamp() as FieldValue };
    const docRef = await db.collection('quizAttempts').add(newAttempt);
    return docRef.id;
}

/**
 * Gets all achievements for a specific user.
 */
export async function getAchievements(userId: string): Promise<UserAchievement[]> {
    console.log(`[DB] getAchievements: Fetching achievements for user ${userId}.`);
    const q = db.collection('userAchievements').where('userId', '==', userId).orderBy('unlockedAt', 'desc');
    const snapshot = await q.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserAchievement));
}

/**
 * Unlocks a specific achievement for a user.
 */
export async function unlockAchievement(userId: string, achievementId: string): Promise<void> {
    const docId = `${userId}_${achievementId}`;
    console.log(`[DB] unlockAchievement: Unlocking '${achievementId}' for user ${userId}.`);
    const achievementRef = db.collection('userAchievements').doc(docId);
    await achievementRef.set({
        userId: userId,
        achievementId: achievementId,
        unlockedAt: serverTimestamp() as FieldValue,
    });
}


'use server';

import { getFirebaseAdminApp, getFirestoreAdmin } from './firebase-admin';
import { serverTimestamp, FieldValue, Timestamp } from 'firebase-admin/firestore';
import type { Quiz, AppUser, QuizAttempt, UserAchievement } from './types';
import { auth as adminAuth } from 'firebase-admin';

// Type for the data to be saved to Firestore, excluding the ID.
type QuizForDb = Omit<Quiz, 'id'>;
const db = getFirestoreAdmin();
const auth = adminAuth(getFirebaseAdminApp());


// Save a quiz to Firestore
export async function saveQuiz(quizData: Omit<Quiz, 'id' | 'createdAt'>): Promise<string> {
  const quizCollection = db.collection('quizzes');
  const newQuiz = {
    ...quizData,
    createdAt: serverTimestamp() as FieldValue,
  };
  const docRef = await quizCollection.add(newQuiz);
  return docRef.id;
}

// Get all quizzes for a specific user (parent)
export async function getQuizzesForUser(userId: string): Promise<Quiz[]> {
  const quizzes: Quiz[] = [];
  const q = db.collection('quizzes').where('userId', '==', userId).orderBy('createdAt', 'desc');
  
  const querySnapshot = await q.get();
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const firestoreTimestamp = data.createdAt as Timestamp;
    quizzes.push({
      id: doc.id,
      ...data,
      createdAt: {
          seconds: firestoreTimestamp.seconds,
          nanoseconds: firestoreTimestamp.nanoseconds,
      },
    } as Quiz);
  });

  return quizzes;
}

// Get a single quiz by its ID
export async function getQuiz(quizId: string): Promise<Quiz | null> {
    const docRef = db.collection('quizzes').doc(quizId);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
        const data = docSnap.data();
        if (!data) return null;
        const firestoreTimestamp = data.createdAt as Timestamp;
        return {
            id: docSnap.id,
            ...data,
             createdAt: {
                seconds: firestoreTimestamp.seconds,
                nanoseconds: firestoreTimestamp.nanoseconds,
            },
        } as Quiz;
    } else {
        return null;
    }
}

// Get user by email
export async function getUserByEmail(email: string): Promise<AppUser | null> {
    const q = db.collection('users').where('email', '==', email.toLowerCase());
    const querySnapshot = await q.get();
    if (querySnapshot.empty) {
        return null;
    }
    const userDoc = querySnapshot.docs[0];
    return {
        uid: userDoc.id,
        ...userDoc.data()
    } as AppUser;
}

// Set parent for a child user and update profile data
export async function setUserParent(childUid: string, parentUid: string): Promise<void> {
    const userDocRef = db.collection('users').doc(childUid);
    await userDocRef.update({
        parentId: parentUid,
    });
}

export async function updateUserProfile(uid: string, data: Partial<Pick<AppUser, 'gradeLevel' | 'dateOfBirth' | 'avatarId'>>): Promise<void> {
    const userDocRef = db.collection('users').doc(uid);
    await userDocRef.update(data);
}


// Get children for a parent
export async function getChildrenForParent(parentId: string): Promise<AppUser[]> {
    const users: AppUser[] = [];
    const q = db.collection('users').where('parentId', '==', parentId);
    const querySnapshot = await q.get();
    querySnapshot.forEach((doc) => {
        users.push({
            uid: doc.id,
            ...doc.data()
        } as AppUser);
    });
    return users;
}

// Get quiz attempts for a specific user
export async function getQuizAttemptsForUser(userId: string): Promise<QuizAttempt[]> {
    const attempts: QuizAttempt[] = [];
    const q = db.collection('quizAttempts').where('userId', '==', userId).orderBy('completedAt', 'desc');
    const querySnapshot = await q.get();
    querySnapshot.forEach((doc) => {
        attempts.push({
            id: doc.id,
            ...doc.data()
        } as QuizAttempt);
    });
    return attempts;
}

// Save a quiz attempt
export async function saveQuizAttempt(attemptData: Omit<QuizAttempt, 'id' | 'completedAt'>): Promise<string> {
    const attemptCollection = db.collection('quizAttempts');
    const newAttempt = {
        ...attemptData,
        completedAt: serverTimestamp() as FieldValue,
    };
    const docRef = await attemptCollection.add(newAttempt);
    return docRef.id;
}


export async function setUserRole(uid: string, role: 'admin' | 'child'): Promise<void> {
    const userDocRef = db.collection('users').doc(uid);
    const updateData: { role: 'admin' | 'child'; parentId?: FieldValue } = { role };

    if (role === 'admin') {
        updateData.parentId = FieldValue.delete();
    }
    
    await userDocRef.update(updateData);
}

// --- Achievements ---

export async function getUserAchievements(userId: string): Promise<UserAchievement[]> {
    const achievements: UserAchievement[] = [];
    const q = db.collection('userAchievements').where('userId', '==', userId).orderBy('unlockedAt', 'desc');
    const querySnapshot = await q.get();
    querySnapshot.forEach((doc) => {
        achievements.push({
            id: doc.id,
            ...doc.data()
        } as UserAchievement);
    });
    return achievements;
}

export async function unlockAchievement(userId: string, achievementId: string): Promise<void> {
    const achievementRef = db.collection('userAchievements').doc(`${userId}_${achievementId}`);
    await achievementRef.set({
        userId: userId,
        achievementId: achievementId,
        unlockedAt: serverTimestamp() as FieldValue,
    });
}

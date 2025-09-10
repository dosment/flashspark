
'use server';

import { getFirebaseAdminApp, getFirestoreAdmin } from './firebase-admin';
import { serverTimestamp, FieldValue, Timestamp } from 'firebase-admin/firestore';
import type { Quiz, AppUser, QuizAttempt, UserAchievement } from './types';
import { auth as adminAuth } from 'firebase-admin';

// Type for the data to be saved to Firestore, excluding the ID.
type QuizForDb = Omit<Quiz, 'id'>;
const db = getFirestoreAdmin();
const auth = adminAuth(getFirebaseAdminApp());


export async function createUser(userData: {email: string, name?: string, role: 'parent' | 'child', parentId?: string, gradeLevel?: string, dateOfBirth?: string}): Promise<AppUser> {
    console.log(`[DB] createUser: Attempting to create Firebase Auth user for email: ${userData.email}`);
    const authUser = await auth.createUser({
        email: userData.email,
        emailVerified: true, // Since we trust the parent creating the account
        displayName: userData.name,
    });
    console.log(`[DB] createUser: Firebase Auth user created successfully, UID: ${authUser.uid}`);

    const newUser: AppUser = {
        uid: authUser.uid,
        email: userData.email.toLowerCase(),
        role: userData.role,
        avatarId: 'avatar-1', // Default avatar
        name: userData.name || userData.email, // Default name to email if not provided
        ...(userData.parentId && { parentId: userData.parentId }),
        ...(userData.gradeLevel && { gradeLevel: userData.gradeLevel }),
        ...(userData.dateOfBirth && { dateOfBirth: userData.dateOfBirth }),
    };

    console.log(`[DB] createUser: Setting Firestore user profile for UID ${authUser.uid} with data:`, newUser);
    await db.collection('users').doc(authUser.uid).set(newUser);
    console.log(`[DB] createUser: Firestore user profile for ${authUser.uid} created successfully.`);
    
    return newUser;
}


// Save a quiz to Firestore
export async function saveQuiz(quizData: Omit<Quiz, 'id' | 'createdAt'>): Promise<string> {
  console.log(`[DB] saveQuiz: Saving quiz titled "${quizData.title}" for user ${quizData.userId}.`);
  const quizCollection = db.collection('quizzes');
  const newQuiz = {
    ...quizData,
    createdAt: serverTimestamp() as FieldValue,
  };
  const docRef = await quizCollection.add(newQuiz);
  console.log(`[DB] saveQuiz: Successfully saved quiz with new ID: ${docRef.id}.`);
  return docRef.id;
}

// Get all quizzes for a specific user (parent)
export async function getQuizzesForUser(userId: string): Promise<Quiz[]> {
  console.log(`[DB] getQuizzesForUser: Fetching quizzes for user ${userId}.`);
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
  console.log(`[DB] getQuizzesForUser: Found ${quizzes.length} quizzes for user ${userId}.`);
  return quizzes;
}

// Get a single quiz by its ID
export async function getQuiz(quizId: string): Promise<Quiz | null> {
    console.log(`[DB] getQuiz: Fetching quiz with ID ${quizId}.`);
    const docRef = db.collection('quizzes').doc(quizId);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
        const data = docSnap.data();
        if (!data) {
             console.warn(`[DB] getQuiz: Document ${quizId} exists but has no data.`);
             return null;
        }
        const firestoreTimestamp = data.createdAt as Timestamp;
        console.log(`[DB] getQuiz: Successfully fetched quiz ${quizId}.`);
        return {
            id: docSnap.id,
            ...data,
             createdAt: {
                seconds: firestoreTimestamp.seconds,
                nanoseconds: firestoreTimestamp.nanoseconds,
            },
        } as Quiz;
    } else {
         console.warn(`[DB] getQuiz: No document found for quiz ID ${quizId}.`);
        return null;
    }
}

// Get user by email
export async function getUserByEmail(email: string): Promise<AppUser | null> {
    console.log(`[DB] getUserByEmail: Searching for user with email ${email}.`);
    const q = db.collection('users').where('email', '==', email.toLowerCase());
    const querySnapshot = await q.get();
    if (querySnapshot.empty) {
        console.log(`[DB] getUserByEmail: No user found for email ${email}.`);
        return null;
    }
    const userDoc = querySnapshot.docs[0];
     console.log(`[DB] getUserByEmail: Found user for email ${email} with UID ${userDoc.id}.`);
    return {
        uid: userDoc.id,
        ...userDoc.data()
    } as AppUser;
}

// Set parent for a child user
export async function setUserParent(childUid: string, parentUid: string): Promise<void> {
    console.log(`[DB] setUserParent: Linking child ${childUid} to parent ${parentUid}.`);
    const userDocRef = db.collection('users').doc(childUid);
    await userDocRef.update({
        parentId: parentUid,
    });
    console.log(`[DB] setUserParent: Successfully updated parentId for child ${childUid}.`);
}

export async function updateUserProfile(uid: string, data: Partial<AppUser>): Promise<void> {
    console.log(`[DB] updateUserProfile: Updating profile for UID ${uid} with data:`, data);
    const userDocRef = db.collection('users').doc(uid);
    const authUser = await auth.getUser(uid);

    const updateData: Partial<AppUser> = {};
    const authUpdateData: {email?: string, displayName?: string} = {};

    if (data.email && data.email.toLowerCase() !== authUser.email) {
        console.log(`[DB] updateUserProfile: Email change detected for ${uid}. Staging for Auth and DB update.`);
        authUpdateData.email = data.email;
        updateData.email = data.email.toLowerCase();
    }

    if (data.name && data.name !== authUser.displayName) {
        console.log(`[DB] updateUserProfile: Name change detected for ${uid}. Staging for Auth and DB update.`);
        authUpdateData.displayName = data.name;
        updateData.name = data.name;
    }

    if (data.gradeLevel) updateData.gradeLevel = data.gradeLevel;
    if (data.dateOfBirth) updateData.dateOfBirth = data.dateOfBirth;
    if (data.avatarId) updateData.avatarId = data.avatarId;

    if (Object.keys(authUpdateData).length > 0) {
        console.log(`[DB] updateUserProfile: Updating Firebase Auth for ${uid}.`);
        await auth.updateUser(uid, authUpdateData);
        console.log(`[DB] updateUserProfile: Firebase Auth updated for ${uid}.`);
    }
    
    if (Object.keys(updateData).length > 0) {
         console.log(`[DB] updateUserProfile: Updating Firestore profile for ${uid}.`);
        await userDocRef.update(updateData);
        console.log(`[DB] updateUserProfile: Firestore profile updated for ${uid}.`);
    }
}


// Get children for a parent
export async function getChildrenForParent(parentId: string): Promise<AppUser[]> {
    console.log(`[DB] getChildrenForParent: Fetching children for parent ${parentId}.`);
    const users: AppUser[] = [];
    const q = db.collection('users').where('parentId', '==', parentId);
    const querySnapshot = await q.get();
    
    for (const doc of querySnapshot.docs) {
        const userData = doc.data() as AppUser;
        try {
            const authUser = await auth.getUser(doc.id);
            userData.lastLogin = authUser.metadata.lastSignInTime;
        } catch (error) {
            console.warn(`[DB] getChildrenForParent: Could not fetch auth data for user ${doc.id}, setting lastLogin to N/A.`, error);
            userData.lastLogin = 'N/A';
        }
        users.push({
            uid: doc.id,
            ...userData
        });
    };
    console.log(`[DB] getChildrenForParent: Found ${users.length} children for parent ${parentId}.`);
    return users;
}

// Get all parents
export async function getParents(): Promise<AppUser[]> {
    console.log(`[DB] getParents: Fetching all users with 'parent' role.`);
    const users: AppUser[] = [];
    const q = db.collection('users').where('role', '==', 'parent');
    const querySnapshot = await q.get();

    for (const doc of querySnapshot.docs) {
        const userData = doc.data() as AppUser;
        try {
            const authUser = await auth.getUser(doc.id);
            userData.lastLogin = authUser.metadata.lastSignInTime;
        } catch (error) {
            console.warn(`[DB] getParents: Could not fetch auth data for user ${doc.id}, setting lastLogin to N/A.`, error);
            userData.lastLogin = 'N/A';
        }
        users.push({
            uid: doc.id,
            ...userData
        });
    };
    console.log(`[DB] getParents: Found ${users.length} total parents.`);
    return users;
}


// Get quiz attempts for a specific user
export async function getQuizAttemptsForUser(userId: string): Promise<QuizAttempt[]> {
    console.log(`[DB] getQuizAttemptsForUser: Fetching attempts for user ${userId}.`);
    const attempts: QuizAttempt[] = [];
    const q = db.collection('quizAttempts').where('userId', '==', userId).orderBy('completedAt', 'desc');
    const querySnapshot = await q.get();
    querySnapshot.forEach((doc) => {
        attempts.push({
            id: doc.id,
            ...doc.data()
        } as QuizAttempt);
    });
     console.log(`[DB] getQuizAttemptsForUser: Found ${attempts.length} attempts for user ${userId}.`);
    return attempts;
}

// Save a quiz attempt
export async function saveQuizAttempt(attemptData: Omit<QuizAttempt, 'id' | 'completedAt'>): Promise<string> {
    console.log(`[DB] saveQuizAttempt: Saving attempt for user ${attemptData.userId} for quiz "${attemptData.quizTitle}".`);
    const attemptCollection = db.collection('quizAttempts');
    const newAttempt = {
        ...attemptData,
        completedAt: serverTimestamp() as FieldValue,
    };
    const docRef = await attemptCollection.add(newAttempt);
    console.log(`[DB] saveQuizAttempt: Successfully saved attempt with ID ${docRef.id}.`);
    return docRef.id;
}


export async function setUserRole(uid: string, role: 'parent' | 'child'): Promise<void> {
    console.log(`[DB] setUserRole: Setting role to '${role}' for user ${uid}.`);
    const userDocRef = db.collection('users').doc(uid);
    const updateData: { role: 'parent' | 'child'; parentId?: FieldValue } = { role };

    if (role === 'parent') {
        console.log(`[DB] setUserRole: User ${uid} is becoming a parent, ensuring parentId is removed.`);
        updateData.parentId = FieldValue.delete();
    }
    
    await userDocRef.update(updateData);
     console.log(`[DB] setUserRole: Successfully updated role for user ${uid}.`);
}

// --- Achievements ---

export async function getUserAchievements(userId: string): Promise<UserAchievement[]> {
    console.log(`[DB] getUserAchievements: Fetching achievements for user ${userId}.`);
    const achievements: UserAchievement[] = [];
    const q = db.collection('userAchievements').where('userId', '==', userId).orderBy('unlockedAt', 'desc');
    const querySnapshot = await q.get();
    querySnapshot.forEach((doc) => {
        achievements.push({
            id: doc.id,
            ...doc.data()
        } as UserAchievement);
    });
    console.log(`[DB] getUserAchievements: Found ${achievements.length} achievements for user ${userId}.`);
    return achievements;
}

export async function unlockAchievement(userId: string, achievementId: string): Promise<void> {
    const docId = `${userId}_${achievementId}`;
    console.log(`[DB] unlockAchievement: Unlocking '${achievementId}' for user ${userId} with doc ID ${docId}.`);
    const achievementRef = db.collection('userAchievements').doc(docId);
    await achievementRef.set({
        userId: userId,
        achievementId: achievementId,
        unlockedAt: serverTimestamp() as FieldValue,
    });
    console.log(`[DB] unlockAchievement: Successfully unlocked achievement.`);
}

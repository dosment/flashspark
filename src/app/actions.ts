
'use server';

import { provideHints } from '@/ai/flows/provide-hints-using-external-knowledge.ts';
import { 
    saveQuiz as saveQuizToDb, 
    getQuizzesForUser, 
    getQuiz,
    getChildrenForParent,
    getQuizAttemptsForUser,
    saveQuizAttempt as saveQuizAttemptToDb,
    setUserParent,
    getUserByEmail,
    setUserRole,
    getUserAchievements,
    unlockAchievement,
    updateUserProfile,
    createUser,
} from '@/lib/firestore';
import { Quiz, QuizAttempt, AppUser, QuizType, UserAchievement, Achievement } from '@/lib/types';
import { getCurrentUser } from '@/lib/auth-utils';
import { ALL_ACHIEVEMENTS } from '@/lib/achievements';


export async function getHintAction(input: { question: string; subject: string }) {
    console.log('[ACTION] getHintAction: Triggered with input:', input);
    try {
        const result = await provideHints(input);
        console.log('[ACTION] getHintAction: Success', result);
        return { hint: result.hint };
    } catch (error) {
        console.error('[ACTION] getHintAction: Error', error);
        return { error: 'Sorry, I could not think of a hint right now.' };
    }
}

export async function saveQuizAction(quizData: { title: string; flashcards: any[]; quizType: QuizType }) {
    console.log('[ACTION] saveQuizAction: Triggered');
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        console.error('[ACTION] saveQuizAction: Error - User not logged in.');
        return { error: 'You must be logged in to save a quiz.' };
    }
     if (currentUser.role !== 'admin') {
        console.error(`[ACTION] saveQuizAction: Error - User ${currentUser.uid} with role ${currentUser.role} is not an admin.`);
        return { error: 'Only parents can create quizzes.' };
    }

    const quiz: Omit<Quiz, 'id' | 'createdAt'> = {
        title: quizData.title,
        flashcards: quizData.flashcards,
        userId: currentUser.uid,
        quizType: quizData.quizType,
    };
    console.log('[ACTION] saveQuizAction: Saving quiz for user', currentUser.uid);

    try {
        const quizId = await saveQuizToDb(quiz);
         console.log('[ACTION] saveQuizAction: Success, saved quiz with ID:', quizId);
        return { success: true, quizId };
    } catch (error) {
        console.error('[ACTION] saveQuizAction: Failed to save quiz to DB', error);
        return { error: 'Failed to save the quiz.' };
    }
}

export async function getQuizzesAction() {
    console.log('[ACTION] getQuizzesAction: Triggered');
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        console.error('[ACTION] getQuizzesAction: Error - User not logged in.');
        return { error: 'You must be logged in to view quizzes.' };
    }
    
    try {
        console.log('[ACTION] getQuizzesAction: Fetching quizzes for user', currentUser.uid);
        const quizzes = await getQuizzesForUser(currentUser.uid);
        console.log(`[ACTION] getQuizzesAction: Success, found ${quizzes.length} quizzes.`);
        return { quizzes };
    } catch (error) {
        console.error('[ACTION] getQuizzesAction: Error fetching quizzes', error);
        return { error: 'Could not fetch your quizzes.' };
    }
}

export async function getQuizAction(quizId: string) {
    console.log('[ACTION] getQuizAction: Triggered for quizId:', quizId);
    try {
        const quiz = await getQuiz(quizId);
        if (!quiz) {
            console.warn('[ACTION] getQuizAction: Quiz not found for id:', quizId);
            return { error: 'Quiz not found.' };
        }
        console.log('[ACTION] getQuizAction: Success, found quiz:', quiz.title);
        return { quiz };
    } catch (error) {
        console.error('[ACTION] getQuizAction: Error fetching quiz', error);
        return { error: 'Could not fetch the quiz.' };
    }
}

export async function getDashboardDataAction() {
    console.log('[ACTION] getDashboardDataAction: Triggered');
    const user = await getCurrentUser();
    if (!user) {
        console.error('[ACTION] getDashboardDataAction: Error - User not logged in.');
        return { error: 'You must be logged in.' };
    }
    console.log(`[ACTION] getDashboardDataAction: Fetching data for user ${user.uid} with role ${user.role}`);

    try {
        if (user.role === 'admin') {
            console.log('[ACTION] getDashboardDataAction: Admin path');
            const [children, quizzes] = await Promise.all([
                getChildrenForParent(user.uid),
                getQuizzesForUser(user.uid)
            ]);
            console.log(`[ACTION] getDashboardDataAction: Found ${children.length} children and ${quizzes.length} quizzes.`);

            const childrenWithAttempts = await Promise.all(
                children.map(async (child) => {
                    const attempts = await getQuizAttemptsForUser(child.uid);
                    return { ...child, attempts };
                })
            );
            const result = { children: childrenWithAttempts, quizzes };
            console.log('[ACTION] getDashboardDataAction: Admin data prepared successfully.');
            return result;
        } else { // Child user
            console.log('[ACTION] getDashboardDataAction: Child path');
            if (!user.parentId) {
                console.log(`[ACTION] getDashboardDataAction: Child ${user.uid} has no parentId.`);
                const attempts = await getQuizAttemptsForUser(user.uid);
                const achievements = await getUserAchievements(user.uid);
                const result = { quizzes: [], attempts, achievements };
                 console.log(`[ACTION] getDashboardDataAction: Standalone child data prepared with ${attempts.length} attempts and ${achievements.length} achievements.`);
                return result;
            }
            console.log(`[ACTION] getDashboardDataAction: Child ${user.uid} has parent ${user.parentId}. Fetching parent's quizzes.`);
            const [quizzes, attempts, achievements] = await Promise.all([
                getQuizzesForUser(user.parentId!),
                getQuizAttemptsForUser(user.uid),
                getUserAchievements(user.uid)
            ]);
            const result = { quizzes, attempts, achievements };
            console.log(`[ACTION] getDashboardDataAction: Linked child data prepared with ${quizzes.length} quizzes, ${attempts.length} attempts, and ${achievements.length} achievements.`);
            return result;
        }
    } catch (error) {
        console.error('[ACTION] getDashboardDataAction: Error fetching dashboard data', error);
        return { error: 'Could not fetch dashboard data.' };
    }
}

export async function getManagedUsersAction() {
    console.log('[ACTION] getManagedUsersAction: Triggered');
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
        console.error('[ACTION] getManagedUsersAction: Error - Not an admin or not logged in.');
        return { error: 'You must be an admin to manage users.' };
    }
    try {
        console.log('[ACTION] getManagedUsersAction: Fetching children for parent:', user.uid);
        const children = await getChildrenForParent(user.uid);
        console.log(`[ACTION] getManagedUsersAction: Success, found ${children.length} children.`);
        return { children };
    } catch (error) {
        console.error('[ACTION] getManagedUsersAction: Error fetching children', error);
        return { error: 'Could not fetch managed users.' };
    }
}

export async function saveQuizAttemptAction(attemptData: Omit<QuizAttempt, 'id' | 'completedAt'>) {
    console.log('[ACTION] saveQuizAttemptAction: Triggered for user:', attemptData.userId);
    try {
        const attemptId = await saveQuizAttemptToDb(attemptData);
        console.log(`[ACTION] saveQuizAttemptAction: Saved attempt with id ${attemptId}. Checking for achievements...`);
        // After saving, check for achievements
        const newAchievements = await checkAndAwardAchievementsAction(attemptData.userId);
        console.log(`[ACTION] saveQuizAttemptAction: Awarded ${newAchievements.length} new achievements.`);
        return { success: true, attemptId, newAchievements };
    } catch (error) {
        console.error('[ACTION] saveQuizAttemptAction: Error saving attempt', error);
        return { error: 'Failed to save the quiz attempt.' };
    }
}

export async function addChildAction(childEmail: string) {
    console.log('[ACTION] addChildAction: Triggered for email:', childEmail);
    const parent = await getCurrentUser();
    if (!parent || parent.role !== 'admin') {
        console.error('[ACTION] addChildAction: Error - Not an admin or not logged in.');
        return { error: 'Only parents can add children.' };
    }

    if (childEmail.toLowerCase() === parent.email?.toLowerCase()) {
        console.error('[ACTION] addChildAction: Error - Parent cannot add self.');
        return { error: 'You cannot add yourself as a child.' };
    }

    try {
        console.log(`[ACTION] addChildAction: Creating user with email: ${childEmail}`);
        const newUser = await createUser({
            email: childEmail,
            role: 'child',
            parentId: parent.uid
        });
        console.log(`[ACTION] addChildAction: Successfully created and linked child user ${newUser.uid}.`);
        return { success: true };

    } catch (error: any) {
        console.error('[ACTION] addChildAction: Unexpected error', error);
        if (error.code === 'auth/email-already-exists') {
            return { error: 'A user with this email address already exists.' };
        }
        return { error: 'An unexpected error occurred while adding the child.' };
    }
}


export async function addParentAction(parentEmail: string) {
    console.log('[ACTION] addParentAction: Triggered for email:', parentEmail);
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
        console.error('[ACTION] addParentAction: Error - Not an admin or not logged in.');
        return { error: 'Only parents can add other parents.' };
    }

    if (parentEmail.toLowerCase() === currentUser.email?.toLowerCase()) {
        console.error('[ACTION] addParentAction: Error - Admin cannot add self.');
        return { error: 'You cannot add yourself as a parent again.' };
    }

    try {
        console.log(`[ACTION] addParentAction: Creating user with email: ${parentEmail} and promoting to admin.`);
        await createUser({
            email: parentEmail,
            role: 'admin'
        });
        console.log(`[ACTION] addParentAction: Successfully created and promoted user.`);
        return { success: true };

    } catch (error: any) {
        console.error('[ACTION] addParentAction: Unexpected error', error);
        if (error.code === 'auth/email-already-exists') {
            return { error: 'A user with this email address already exists.' };
        }
        return { error: 'An unexpected error occurred while adding the parent.' };
    }
}

async function checkAndAwardAchievementsAction(userId: string): Promise<Achievement[]> {
    console.log('[ACHIEVEMENT] checkAndAwardAchievementsAction: Checking for user:', userId);
    const newlyUnlocked: Achievement[] = [];
    try {
        const [attempts, unlocked, allAchievements] = await Promise.all([
            getQuizAttemptsForUser(userId),
            getUserAchievements(userId),
            Promise.resolve(ALL_ACHIEVEMENTS)
        ]);

        const unlockedIds = new Set(unlocked.map(a => a.achievementId));
        const allAchievementsMap = new Map(allAchievements.map(a => [a.id, a]));
        console.log(`[ACHIEVEMENT] User ${userId} has ${attempts.length} attempts and ${unlockedIds.size} unlocked achievements.`);

        const checkAndUnlock = async (achievementId: string, condition: boolean) => {
            if (!unlockedIds.has(achievementId) && condition) {
                console.log(`[ACHIEVEMENT] Unlocking '${achievementId}' for user ${userId}.`);
                await unlockAchievement(userId, achievementId);
                const achievement = allAchievementsMap.get(achievementId);
                if (achievement) {
                    newlyUnlocked.push(achievement);
                }
            }
        };
        
        if (attempts.length === 0) return [];
        const latestAttempt = attempts[0];

        // --- Quiz-based Achievements ---
        await checkAndUnlock('first-quiz', attempts.length >= 1);
        await checkAndUnlock('five-quizzes', attempts.length >= 5);
        await checkAndUnlock('perfect-score', latestAttempt.score === latestAttempt.totalQuestions);
        
        // --- Flashcard-based Achievements ---
        const totalFlashcardsStudied = attempts.reduce((sum, attempt) => sum + attempt.totalQuestions, 0);
        console.log(`[ACHIEVEMENT] User ${userId} has studied ${totalFlashcardsStudied} total flashcards.`);
        await checkAndUnlock('apprentice-scholar', totalFlashcardsStudied >= 25);
        await checkAndUnlock('journeyman-scholar', totalFlashcardsStudied >= 100);
        await checkAndUnlock('master-scholar', totalFlashcardsStudied >= 500);

    } catch (error) {
        console.error(`[ACHIEVEMENT] Failed to check/award achievements for user ${userId}:`, error);
    }
    console.log(`[ACHIEVEMENT] Finished check for ${userId}. Awarded ${newlyUnlocked.length} new achievements.`);
    return newlyUnlocked;
}

    
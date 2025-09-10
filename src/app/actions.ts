
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
} from '@/lib/firestore';
import { Quiz, QuizAttempt, AppUser, QuizType, UserAchievement, Achievement } from '@/lib/types';
import { getCurrentUser } from '@/lib/auth-utils';
import { ALL_ACHIEVEMENTS } from '@/lib/achievements';


export async function getHintAction(input: { question: string; subject: string }) {
    try {
        const result = await provideHints(input);
        return { hint: result.hint };
    } catch (error) {
        console.error('Hint generation error:', error);
        return { error: 'Sorry, I could not think of a hint right now.' };
    }
}

export async function saveQuizAction(quizData: { title: string; flashcards: any[]; quizType: QuizType }) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return { error: 'You must be logged in to save a quiz.' };
    }
     if (currentUser.role !== 'admin') {
        return { error: 'Only parents can create quizzes.' };
    }

    const quiz: Omit<Quiz, 'id' | 'createdAt'> = {
        title: quizData.title,
        flashcards: quizData.flashcards,
        userId: currentUser.uid,
        quizType: quizData.quizType,
    };

    try {
        const quizId = await saveQuizToDb(quiz);
        return { success: true, quizId };
    } catch (error) {
        console.error('Failed to save quiz:', error);
        return { error: 'Failed to save the quiz.' };
    }
}

export async function getQuizzesAction() {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return { error: 'You must be logged in to view quizzes.' };
    }
    
    // This action is primarily for the parent to see their own quizzes.
    const userIdToFetch = currentUser.uid;
    
    try {
        const quizzes = await getQuizzesForUser(userIdToFetch);
        return { quizzes };
    } catch (error) {
        console.error('Failed to get quizzes:', error);
        return { error: 'Could not fetch your quizzes.' };
    }
}

export async function getQuizAction(quizId: string) {
    try {
        const quiz = await getQuiz(quizId);
        if (!quiz) {
            return { error: 'Quiz not found.' };
        }
        return { quiz };
    } catch (error) {
        console.error('Failed to get quiz:', error);
        return { error: 'Could not fetch the quiz.' };
    }
}

export async function getDashboardDataAction() {
    const user = await getCurrentUser();
    if (!user) {
        return { error: 'You must be logged in.' };
    }

    try {
        if (user.role === 'admin') {
            const [children, quizzes] = await Promise.all([
                getChildrenForParent(user.uid),
                getQuizzesForUser(user.uid)
            ]);

            const childrenWithAttempts = await Promise.all(
                children.map(async (child) => {
                    const attempts = await getQuizAttemptsForUser(child.uid);
                    return { ...child, attempts };
                })
            );
            return { children: childrenWithAttempts, quizzes };
        } else { // Child user
            if (!user.parentId) {
                const attempts = await getQuizAttemptsForUser(user.uid);
                const achievements = await getUserAchievements(user.uid);
                return { quizzes: [], attempts, achievements };
            }
            const quizzes = await getQuizzesForUser(user.parentId!);
            const attempts = await getQuizAttemptsForUser(user.uid);
            const achievements = await getUserAchievements(user.uid);
            return { quizzes, attempts, achievements };
        }
    } catch (error) {
        console.error('Failed to get dashboard data:', error);
        return { error: 'Could not fetch dashboard data.' };
    }
}

export async function saveQuizAttemptAction(attemptData: Omit<QuizAttempt, 'id' | 'completedAt'>) {
    try {
        const attemptId = await saveQuizAttemptToDb(attemptData);
        // After saving, check for achievements
        const newAchievements = await checkAndAwardAchievementsAction(attemptData.userId);
        return { success: true, attemptId, newAchievements };
    } catch (error) {
        console.error('Failed to save quiz attempt:', error);
        return { error: 'Failed to save the quiz attempt.' };
    }
}

export async function addChildAction(childEmail: string) {
    const parent = await getCurrentUser();
    if (!parent || parent.role !== 'admin') {
        return { error: 'Only parents can add children.' };
    }

    if (childEmail.toLowerCase() === parent.email?.toLowerCase()) {
        return { error: 'You cannot add yourself as a child.' };
    }

    try {
        // Find the user with the given email.
        const childUser = await getUserByEmail(childEmail);

        if (!childUser) {
            return { error: 'No user found with this email. Please ask your child to sign up first.' };
        }

        if (childUser.parentId) {
            if (childUser.parentId === parent.uid) {
                return { error: 'This child is already linked to your account.' };
            } else {
                return { error: 'This child is already linked to another parent account.' };
            }
        }
        
        if (childUser.role === 'admin') {
             return { error: 'This user is a parent and cannot be added as a child.' };
        }

        // Link the child to the parent.
        await setUserParent(childUser.uid, parent.uid);

        return { success: true };
    } catch (error: any) {
        console.error('Failed to add child:', error);
        return { error: 'An unexpected error occurred while adding the child.' };
    }
}


export async function addParentAction(parentEmail: string) {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
        return { error: 'Only parents can add other parents.' };
    }

    if (parentEmail.toLowerCase() === currentUser.email?.toLowerCase()) {
        return { error: 'You cannot add yourself as a parent again.' };
    }

    try {
        const newParentUser = await getUserByEmail(parentEmail);

        if (!newParentUser) {
            return { error: 'No user found with this email. Please ensure the new parent has signed up first.' };
        }

        if (newParentUser.role === 'admin') {
            return { error: 'This user is already a parent.' };
        }

        await setUserRole(newParentUser.uid, 'admin');

        return { success: true };
    } catch (error) {
        console.error('Failed to add parent:', error);
        return { error: 'An unexpected error occurred while adding the parent.' };
    }
}

async function checkAndAwardAchievementsAction(userId: string): Promise<Achievement[]> {
    const newlyUnlocked: Achievement[] = [];
    try {
        const [attempts, unlocked, allAchievements] = await Promise.all([
            getQuizAttemptsForUser(userId),
            getUserAchievements(userId),
            Promise.resolve(ALL_ACHIEVEMENTS) // Use the imported constant
        ]);

        const unlockedIds = new Set(unlocked.map(a => a.achievementId));
        const allAchievementsMap = new Map(allAchievements.map(a => [a.id, a]));

        const checkAndUnlock = async (achievementId: string, condition: boolean) => {
            if (!unlockedIds.has(achievementId) && condition) {
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
        await checkAndUnlock('apprentice-scholar', totalFlashcardsStudied >= 25);
        await checkAndUnlock('journeyman-scholar', totalFlashcardsStudied >= 100);
        await checkAndUnlock('master-scholar', totalFlashcardsStudied >= 500);

    } catch (error) {
        console.error(`Failed to check/award achievements for user ${userId}:`, error);
        // We don't return an error to the user as this is a background process
    }
    return newlyUnlocked;
}

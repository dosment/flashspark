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
    getPreloadedQuizzes,
    getUserAchievements,
    unlockAchievement,
    updateUserProfile,
    createNewUser,
} from '@/lib/firestore';
import { Quiz, QuizAttempt, AppUser, QuizType, UserAchievement } from '@/lib/types';
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
    
    // A child should request quizzes made by their parent. A parent (admin) can see their own quizzes.
    const userIdToFetch = currentUser.role === 'child' ? currentUser.parentId : currentUser.uid;

    if (!userIdToFetch) {
        if (currentUser.role === 'child') {
            return { quizzes: [] }; // Child not linked to a parent yet
        }
        return { error: 'User ID is required.' };
    }
    
    try {
        const quizzes = await getQuizzesForUser(userIdToFetch);
        return { quizzes };
    } catch (error) {
        console.error('Failed to get quizzes:', error);
        return { error: 'Could not fetch your quizzes.' };
    }
}

export async function getPreloadedQuizzesAction() {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return { error: 'You must be logged in to view pre-loaded quizzes.' };
    }

    try {
        const quizzes = await getPreloadedQuizzes();
        return { quizzes };
    } catch (error) {
        console.error('Failed to get pre-loaded quizzes:', error);
        return { error: 'Could not fetch pre-loaded quizzes.' };
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
            const children = await getChildrenForParent(user.uid);
            const childrenWithAttempts = await Promise.all(
                children.map(async (child) => {
                    const attempts = await getQuizAttemptsForUser(child.uid);
                    return { ...child, attempts };
                })
            );
            return { children: childrenWithAttempts };
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
        await checkAndAwardAchievementsAction(attemptData.userId);
        return { success: true, attemptId };
    } catch (error) {
        console.error('Failed to save quiz attempt:', error);
        return { error: 'Failed to save the quiz attempt.' };
    }
}

export async function addChildAction(childData: {email: string; password?: string; gradeLevel: string; dateOfBirth?: string}) {
    const parent = await getCurrentUser();
    if (!parent || parent.role !== 'admin') {
        return { error: 'Only parents can add children.' };
    }

    if (childData.email.toLowerCase() === parent.email?.toLowerCase()) {
        return { error: 'You cannot add yourself as a child.' };
    }

    try {
        // Check if a user with this email already exists
        const existingUser = await getUserByEmail(childData.email);
        if (existingUser) {
            return { error: 'A user with this email already exists.' };
        }

        // Create the new user
        const newUser = await createNewUser({
            email: childData.email,
            password: childData.password,
            parentId: parent.uid,
            gradeLevel: childData.gradeLevel,
            dateOfBirth: childData.dateOfBirth,
        });

        if (newUser) {
            return { success: true };
        } else {
            return { error: 'Failed to create new user.' };
        }
    } catch (error: any) {
        console.error('Failed to add child:', error);
        // Provide more specific error messages
        if (error.code === 'auth/email-already-exists') {
            return { error: 'This email address is already in use by another account.' };
        }
        if (error.code === 'auth/invalid-password') {
            return { error: 'The password must be at least 6 characters long.' };
        }
        return { error: error.message || 'An unexpected error occurred while adding the child.' };
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

async function checkAndAwardAchievementsAction(userId: string) {
    try {
        const [attempts, unlocked] = await Promise.all([
            getQuizAttemptsForUser(userId),
            getUserAchievements(userId)
        ]);

        const unlockedIds = new Set(unlocked.map(a => a.achievementId));

        const checkAndUnlock = async (achievementId: string, condition: boolean) => {
            if (!unlockedIds.has(achievementId) && condition) {
                await unlockAchievement(userId, achievementId);
            }
        };
        
        if (attempts.length === 0) return;
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
}
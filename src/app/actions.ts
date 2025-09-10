'use server';

import { revalidatePath } from 'next/cache';
import { FirebaseError } from 'firebase-admin/app';

import { AppUser, Role, Roles } from '@/lib/types';
import { getAuthenticatedAppUser } from '@/lib/firebase-admin';
import {
    createUser,
    getManagedUsers,
    getUserByEmail,
    updateUser,
    getQuizzes,
    getQuizAttempts,
    getAchievements,
    getAllUsers
} from '@/lib/firestore';

/**
 * Server action for the dashboard to fetch all necessary data based on user role.
 */
export async function getDashboardDataAction(): Promise<{
    usersWithAttempts?: (AppUser & { attempts: QuizAttempt[] })[],
    quizzes?: Quiz[],
    achievements?: UserAchievement[],
    attempts?: QuizAttempt[],
    error?: string
}> {
    try {
        const user = await getAuthenticatedAppUser();

        if (user.role === Roles.ADMIN) {
            const allUsers = await getAllUsers();
            const allQuizzes = await getQuizzes();
            const usersWithAttempts = await Promise.all(allUsers.map(async (u) => {
                const attempts = await getQuizAttempts(u.uid);
                return { ...u, attempts };
            }));
            return { usersWithAttempts, quizzes: allQuizzes };
        }

        if (user.role === Roles.PARENT) {
            const children = await getManagedUsers(user.uid);
            const quizzes = await getQuizzes(user.uid);
            const usersWithAttempts = await Promise.all(children.map(async (child) => {
                const attempts = await getQuizAttempts(child.uid);
                return { ...child, attempts };
            }));
            return { usersWithAttempts, quizzes };
        }

        if (user.role === Roles.CHILD) {
            const parentQuizzes = user.parentIds ? (await Promise.all(user.parentIds.map(id => getQuizzes(id)))).flat() : [];
            const attempts = await getQuizAttempts(user.uid);
            const achievements = await getAchievements(user.uid);
            return { quizzes: parentQuizzes, attempts, achievements };
        }

        return { error: 'Invalid user role.' };
    } catch (e) {
        const error = e as FirebaseError;
        return { error: `Failed to fetch dashboard data: ${error.message}` };
    }
}

/**
 * Server action to add a new child to the current user's account.
 */
export async function addChildAction(prevState: any, formData: FormData) {
    const user = await getAuthenticatedAppUser();
    const childEmail = formData.get('email') as string;
    const childName = formData.get('name') as string;

    if (user.role !== Roles.PARENT && user.role !== Roles.ADMIN) {
        return { message: 'Only parents and admins can add children.' };
    }

    try {
        const existingUser = await getUserByEmail(childEmail);

        if (existingUser) {
            if (existingUser.role === Roles.PARENT || (existingUser.parentIds && existingUser.parentIds.length > 0)) {
                return { message: 'This user is already a parent or has a parent.' };
            }
            await updateUser(existingUser.uid, {
                parentIds: [...(existingUser.parentIds || []), user.uid],
            });
        } else {
            await createUser({
                email: childEmail,
                name: childName,
                role: Roles.CHILD,
                parentIds: [user.uid],
            });
        }
        revalidatePath('/settings');
        return { message: 'Child added successfully' };
    } catch (e) {
        const error = e as FirebaseError;
        return { message: `Error adding child: ${error.message}` };
    }
}

/**
 * Server action to retrieve all users managed by the current user.
 */
export async function getManagedUsersAction() {
    const user = await getAuthenticatedAppUser();
    if (user.role === Roles.ADMIN) {
        return getAllUsers();
    }
    if (user.role === Roles.PARENT) {
        return getManagedUsers(user.uid);
    }
    throw new Error('Only parents or admins can manage users.');
}

/**
 * Server action for a parent or admin to remove a child.
 */
export async function removeChildAction(childId: string) {
    const user = await getAuthenticatedAppUser();

    if (user.role !== Roles.PARENT && user.role !== Roles.ADMIN) {
        return { error: 'You do not have permission to remove children.' };
    }

    try {
        // A bit of a hack to get the child user object using the updateUser function
        const childUser = await updateUser(childId, {}); 
        if (!childUser) {
            return { error: 'Child not found.' };
        }

        if (user.role === Roles.ADMIN) {
            await updateUser(childId, { parentIds: [] });
            revalidatePath('/settings');
            return { message: 'Child has been orphaned by admin.' };
        }

        if (user.role === Roles.PARENT) {
            if (!childUser.parentIds || !childUser.parentIds.includes(user.uid)) {
                return { error: 'You are not a parent of this child.' };
            }
            const updatedParentIds = childUser.parentIds.filter(id => id !== user.uid);
            await updateUser(childId, { parentIds: updatedParentIds });
            revalidatePath('/settings');
            return { message: 'Child removed from your account.' };
        }

    } catch (e) {
        const error = e as FirebaseError;
        return { error: `Error removing child: ${error.message}` };
    }
}

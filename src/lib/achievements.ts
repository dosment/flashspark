
import { Award, BookCopy, Star, Target, Zap, type LucideIcon } from 'lucide-react';
import type { Achievement } from './types';

export const ALL_ACHIEVEMENTS: Achievement[] = [
    {
        id: 'first-quiz',
        name: 'First Step',
        description: 'Completed your first quiz.',
        icon: Star
    },
    {
        id: 'five-quizzes',
        name: 'Quiz Regular',
        description: 'Completed 5 quizzes.',
        icon: Target
    },
    {
        id: 'perfect-score',
        name: 'Perfectionist',
        description: 'Achieved a perfect score on a quiz.',
        icon: Award
    },
    {
        id: 'apprentice-scholar',
        name: 'Apprentice Scholar',
        description: 'Studied over 25 flashcards.',
        icon: BookCopy
    },
    {
        id: 'journeyman-scholar',
        name: 'Journeyman Scholar',
        description: 'Studied over 100 flashcards.',
        icon: BookCopy
    },
    {
        id: 'master-scholar',
        name: 'Master Scholar',
        description: 'Studied over 500 flashcards.',
        icon: Zap
    }
];

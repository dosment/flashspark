import type { User as FirebaseAuthUser } from 'firebase/auth';
import type { LucideIcon } from 'lucide-react';
import type { Timestamp } from 'firebase/firestore';

// Defines the valid roles in the application
export const Roles = {
  ADMIN: 'admin',
  PARENT: 'parent',
  CHILD: 'child',
} as const;

export type Role = typeof Roles[keyof typeof Roles];

export type Flashcard = {
  question: string;
  answer: string;
  options: string[];
  hint?: string;
};

export interface AuthContextType {
  user: AppUser | null;
  firebaseUser: FirebaseAuthUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<any>;
  logOut: () => Promise<void>;
}

export type QuizType = 'vocabulary' | 'standard';

export type Quiz = {
  id?: string;
  title: string;
  flashcards: Flashcard[];
  userId: string; // The ID of the parent who created it
  quizType: QuizType;
  createdAt: Timestamp;
};

export type AppUser = {
    uid: string;
    email: string | null;
    role: Role;
    name?: string;
    parentIds?: string[]; // ID of the parent (admin) user for children
    gradeLevel?: string;
    dateOfBirth?: string;
    avatarId?: string;
    lastLogin?: string;
    // Deprecated, use parentIds
    parentId?: string; 
}

export type AnsweredFlashcard = {
    question: string;
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
};

export type QuizAttempt = {
    id?: string;
    quizId: string;
    quizTitle: string;
    userId: string; // The ID of the child who took the quiz
    score: number;
    totalQuestions: number;
    answeredFlashcards: AnsweredFlashcard[];
    completedAt: any;
};

export type Achievement = {
    id: string;
    name: string;
    description: string;
    icon: LucideIcon;
};

export type UserAchievement = {
    id: string;
    userId: string;
    achievementId: string;
    unlockedAt: any;
};

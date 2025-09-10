
import type { User as FirebaseAuthUser } from 'firebase/auth';
import type { LucideIcon } from 'lucide-react';
import type { Timestamp } from 'firebase/firestore';

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

export type PreloadedQuiz = {
  id: string;
  title:string;
  flashcards: Flashcard[];
  quizType: QuizType;
}

export type AppUser = {
    uid: string;
    email: string | null;
    role: 'admin' | 'child';
    parentId?: string; // ID of the parent (admin) user for children
    gradeLevel?: string;
    dateOfBirth?: string;
    avatarId?: string;
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

    
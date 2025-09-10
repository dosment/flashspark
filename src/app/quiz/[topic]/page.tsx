
'use client';

import { Suspense, useEffect, useState } from 'react';
import { getQuizAction } from '@/app/actions';
import { QuizClient } from './quiz-client';
import Header from '@/components/Header';
import Loading from '@/app/loading';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, useParams } from 'next/navigation';
import { Quiz } from '@/lib/types';

function QuizDataFetcher() {
  const params = useParams();
  const quizId = params.topic as string; // 'topic' is the dynamic segment name
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (quizId) {
      const fetchQuiz = async () => {
        setIsLoading(true);
        const result = await getQuizAction(quizId);
        if (result.quiz) {
          setQuiz(result.quiz);
        } else {
          setError(result.error || 'Failed to load quiz.');
        }
        setIsLoading(false);
      };
      fetchQuiz();
    }
  }, [quizId]);

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-2xl py-12">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Oops! Something went wrong.</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
        <div className="mt-6 text-center">
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (quiz) {
    return <QuizClient flashcards={quiz.flashcards} topic={quiz.title} quizType={quiz.quizType} />;
  }

  return null;
}

function QuizPageContent() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <LoaderCircle className="w-12 h-12 animate-spin text-primary mb-4" />
        <h1 className="text-2xl font-bold font-headline text-primary-foreground">
          Loading Quiz...
        </h1>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Suspense fallback={<Loading />}>
          <QuizDataFetcher />
        </Suspense>
      </main>
    </div>
  );
}

export default function QuizPage() {
  return <QuizPageContent />;
}

    
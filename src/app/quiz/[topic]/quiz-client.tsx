
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Flashcard, QuizAttempt, QuizType, AnsweredFlashcard, Achievement } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb, LoaderCircle, Repeat, CheckCircle, XCircle, Award } from 'lucide-react';
import Confetti from '@/components/confetti';
import { cn } from '@/lib/utils';
import { getHintAction, saveQuizAttemptAction } from '@/app/actions';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface QuizClientProps {
  flashcards: Flashcard[];
  topic: string;
  quizType: QuizType;
}

type StudyMode = 'definition-first' | 'term-first';

export function QuizClient({ flashcards, topic, quizType }: QuizClientProps) {
  const { user } = useAuth();
  const params = useParams();
  const quizId = params.topic as string;
  const { toast } = useToast();

  const [studyMode, setStudyMode] = useState<StudyMode | null>(quizType === 'vocabulary' ? 'definition-first' : 'definition-first');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [isHintLoading, setIsHintLoading] = useState(false);
  const [hintError, setHintError] = useState<string | null>(null);
  const [answeredFlashcards, setAnsweredFlashcards] = useState<AnsweredFlashcard[]>([]);
  const [isStarted, setIsStarted] = useState(quizType !== 'vocabulary');
  
  const currentFlashcard = useMemo(() => {
      if (!studyMode) return null;
      const originalCard = flashcards[currentIndex];
      if (studyMode === 'term-first') {
          // Swap question and answer for term-first mode
          return {
              ...originalCard,
              question: originalCard.answer,
              answer: originalCard.question,
          }
      }
      return originalCard;
  }, [flashcards, currentIndex, studyMode]);

  const shuffledOptions = useMemo(() => {
    if (!currentFlashcard || !studyMode) return [];
  
    // For standard quizzes, the options are already defined.
    if (quizType === 'standard') {
        return [...currentFlashcard.options].sort(() => Math.random() - 0.5);
    }
  
    // For vocabulary quizzes, we generate options.
    const correctAnswer = currentFlashcard.answer;
    let distractors: string[];
  
    if (studyMode === 'term-first') {
      // The "answer" is the definition (original question). Distractors are other definitions.
      distractors = flashcards
        .map(fc => fc.question)
        .filter(def => def !== correctAnswer);
    } else {
      // The "answer" is the term (original answer). Distractors are other terms.
      distractors = flashcards
        .map(fc => fc.answer)
        .filter(term => term !== correctAnswer);
    }
  
    // Fallback to original options if generation fails
    const originalOptions = studyMode === 'term-first' ? flashcards.map(fc => fc.question) : currentFlashcard.options;
  
    const options = new Set<string>([correctAnswer]);
    while (options.size < 4 && distractors.length > 0) {
      const randomIndex = Math.floor(Math.random() * distractors.length);
      options.add(distractors.splice(randomIndex, 1)[0]);
    }
  
    // If we still don't have enough options, pull from the original card's options
    while (options.size < 4 && originalOptions.length > 0) {
       const randomOption = originalOptions[Math.floor(Math.random() * originalOptions.length)];
       if (randomOption !== correctAnswer) {
            options.add(randomOption);
       }
       // to prevent infinite loops with small option sets
       if (options.size >= originalOptions.length) break;
    }
  
    return Array.from(options).sort(() => Math.random() - 0.5);
  
  }, [currentFlashcard, flashcards, studyMode, quizType]);

  const handleAnswer = (option: string) => {
    if (isAnswered || !currentFlashcard) return;

    const isCorrect = option === currentFlashcard.answer;
    
    setIsAnswered(true);
    setSelectedAnswer(option);
    
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    setAnsweredFlashcards(prev => [...prev, {
        question: currentFlashcard.question,
        selectedAnswer: option,
        correctAnswer: currentFlashcard.answer,
        isCorrect: isCorrect
    }]);
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      resetQuestionState();
    } else {
      setQuizCompleted(true);
    }
  };

  const resetQuestionState = () => {
    setIsAnswered(false);
    setSelectedAnswer(null);
    setHint(null);
    setHintError(null);
  };
  
  const startQuiz = (mode: StudyMode) => {
    setStudyMode(mode);
    setCurrentIndex(0);
    setScore(0);
    setQuizCompleted(false);
    resetQuestionState();
    setAnsweredFlashcards([]);
    setIsStarted(true);
  }

  const handlePlayAgain = () => {
    setIsStarted(quizType !== 'vocabulary');
    setCurrentIndex(0);
    setScore(0);
    setQuizCompleted(false);
    resetQuestionState();
    setAnsweredFlashcards([]);
  };

  const handleGetHint = useCallback(async () => {
    if (!currentFlashcard) return;
    setIsHintLoading(true);
    setHintError(null);
    
    // Ensure we send the original question (the definition) to the hint generator
    const originalQuestion = studyMode === 'term-first' ? currentFlashcard.answer : currentFlashcard.question;

    const result = await getHintAction({
      question: originalQuestion,
      subject: topic,
    });
    if (result.hint) {
      setHint(result.hint);
    } else {
      setHintError(result.error || 'Could not load hint.');
    }
    setIsHintLoading(false);
  }, [currentFlashcard, topic, studyMode]);

  useEffect(() => {
    const saveAttempt = async () => {
        if (quizCompleted && user) {
            const attempt: Omit<QuizAttempt, 'id' | 'completedAt'> = {
                quizId,
                quizTitle: topic,
                userId: user.uid,
                score,
                totalQuestions: flashcards.length,
                answeredFlashcards: answeredFlashcards
            };
            const result = await saveQuizAttemptAction(attempt);
            if (result.error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not save your quiz result.'})
            } else {
                toast({ variant: 'default', title: 'Progress Saved', description: 'Your quiz results have been saved.'})
            }
            if (result.newAchievements && result.newAchievements.length > 0) {
              result.newAchievements.forEach((achievement: Achievement) => {
                setTimeout(() => {
                  toast({
                    title: 'Achievement Unlocked!',
                    description: (
                      <div className="flex items-center gap-3">
                        <Award className="w-8 h-8 text-amber-500" />
                        <div>
                          <p className="font-bold">{achievement.name}</p>
                          <p className="text-xs">{achievement.description}</p>
                        </div>
                      </div>
                    ),
                    duration: 5000,
                  });
                }, 500); // Stagger notifications slightly
              });
            }
        }
    };
    saveAttempt();
  }, [quizCompleted, user, quizId, topic, score, flashcards.length, toast, answeredFlashcards]);

  if (!isStarted) {
    return (
      <div className="container mx-auto max-w-2xl py-8 md:py-12">
        <Card className="w-full shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">{topic}</CardTitle>
            <CardDescription>How would you like to study these flashcards?</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button size="lg" className="h-auto py-4" onClick={() => startQuiz('definition-first')}>
                Start with Definition
                <p className="font-normal text-sm text-primary-foreground/80 block w-full">You'll be shown the definition and asked to choose the correct term.</p>
              </Button>
              <Button size="lg" className="h-auto py-4" onClick={() => startQuiz('term-first')}>
                Start with Term
                <p className="font-normal text-sm text-primary-foreground/80 block w-full">You'll be shown the term and asked to choose the correct definition.</p>
              </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentFlashcard) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
            <LoaderCircle className="w-12 h-12 animate-spin text-primary mb-4" />
            <h1 className="text-2xl font-bold font-headline text-primary-foreground">
            Loading...
            </h1>
        </div>
      );
  }

  return (
    <div className="container mx-auto max-w-2xl py-8 md:py-12">
      <Card className="w-full shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardDescription>
              Question {currentIndex + 1} of {flashcards.length}
            </CardDescription>
            <Button variant="ghost" size="sm" onClick={handlePlayAgain}>
              <Repeat className="mr-2 h-4 w-4" />
              {quizType === 'vocabulary' ? 'Change Mode' : 'Start Over'}
            </Button>
          </div>
          <Progress
            value={((currentIndex + 1) / flashcards.length) * 100}
            className="w-full"
          />
          <CardTitle className="pt-6 text-2xl font-headline">
            {currentFlashcard.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shuffledOptions.map((option, index) => {
            const isCorrect = option === currentFlashcard.answer;
            const isSelected = option === selectedAnswer;

            return (
              <Button
                key={index}
                variant="outline"
                size="lg"
                className={cn(
                  'h-auto py-4 whitespace-normal justify-start text-left text-base',
                  'data-[correct=true]:bg-green-200 data-[correct=true]:border-green-400 data-[correct=true]:text-green-900 data-[correct=true]:hover:bg-green-300',
                  'data-[incorrect=true]:bg-red-200 data-[incorrect=true]:border-red-400 data-[incorrect=true]:text-red-900 data-[incorrect=true]:hover:bg-red-300',
                  isAnswered && !isSelected && 'opacity-70'
                )}
                data-correct={isAnswered && isCorrect}
                data-incorrect={isAnswered && isSelected && !isCorrect}
                onClick={() => handleAnswer(option)}
                disabled={isAnswered}
              >
                <span className="mr-4 font-bold">{String.fromCharCode(65 + index)}</span>
                <span className="flex-1">{option}</span>
              </Button>
            );
          })}
        </CardContent>
        <CardFooter className="flex-col items-start gap-4">
          <div className="flex w-full justify-between items-center">
            <div>
              {!hint && !isHintLoading && currentFlashcard.hint && studyMode === 'definition-first' && (
                <Button variant="ghost" size="sm" onClick={() => setHint(currentFlashcard.hint!)}>
                  <Lightbulb className="mr-2 h-4 w-4" />
                  Show built-in hint
                </Button>
              )}
               {!hint && !isHintLoading && (
                <Button variant="ghost" size="sm" onClick={handleGetHint}>
                  <Lightbulb className="mr-2 h-4 w-4" />
                  Need a hint?
                </Button>
              )}
            </div>
            {isAnswered && (
              <Button onClick={handleNext} className="bg-accent hover:bg-accent/90">
                {currentIndex < flashcards.length - 1 ? 'Next Question' : 'Finish Quiz'}
              </Button>
            )}
          </div>
          {isHintLoading && (
             <div className="flex items-center text-muted-foreground"><LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Thinking of a good hint...</div>
          )}
          {(hint || hintError) && (
             <Alert variant={hintError ? "destructive" : "default"}>
                <Lightbulb className="h-4 w-4" />
                <AlertTitle>{hintError ? "Error" : "Hint"}</AlertTitle>
                <AlertDescription>{hint || hintError}</AlertDescription>
            </Alert>
          )}
        </CardFooter>
      </Card>

      <Dialog open={quizCompleted} onOpenChange={setQuizCompleted}>
        <DialogContent className="sm:max-w-lg text-center">
          {score === flashcards.length && <Confetti />}
          <DialogHeader className="text-center items-center">
            <DialogTitle className="text-3xl font-headline mt-4">
              {score / flashcards.length >= 0.8 ? 'Excellent!' : 'Quiz Completed!'}
            </DialogTitle>
             <DialogDescription className="text-lg">
              You scored {score} out of {flashcards.length}.
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-60 w-full pr-6 text-left">
            <div className="space-y-4">
                {answeredFlashcards.map((card, index) => (
                    <div key={index} className="p-3 rounded-md bg-muted">
                        <p className="font-semibold mb-2">{index + 1}. {card.question}</p>
                        <div className="flex items-center gap-2">
                           {card.isCorrect ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                                <XCircle className="h-5 w-5 text-red-600" />
                            )}
                            <p className={cn(card.isCorrect ? 'text-green-700' : 'text-red-700', 'text-sm')}>
                                {card.isCorrect ? 'Correct!' : `Your answer: ${card.selectedAnswer}`}
                            </p>
                        </div>
                        {!card.isCorrect && (
                             <div className="flex items-center gap-2 mt-1 pl-7">
                                 <p className="text-sm text-muted-foreground">
                                     Correct answer: {card.correctAnswer}
                                 </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
          </ScrollArea>

          <DialogFooter className="sm:justify-center gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={handlePlayAgain}>
              Play Again
            </Button>
            <Button type="button" asChild>
                <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

    
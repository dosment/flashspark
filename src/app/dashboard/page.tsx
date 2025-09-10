
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoaderCircle, PlusCircle, Trash2, Play, Eye, BookOpen, UserPlus, ShieldPlus } from 'lucide-react';
import { getDashboardDataAction, getQuizzesAction } from '@/app/actions';
import type { Quiz, AppUser, QuizAttempt, QuizType, UserAchievement } from '@/lib/types';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AddChildDialog } from '@/components/AddChildDialog';
import { AddParentDialog } from '@/components/AddParentDialog';
import ScienceIcon from '@/components/icons/ScienceIcon';
import HistoryIcon from '@/components/icons/HistoryIcon';
import MathIcon from '@/components/icons/MathIcon';
import { ALL_ACHIEVEMENTS } from '@/lib/achievements';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type ChildWithAttempts = AppUser & { attempts: QuizAttempt[] };

const getQuizIcon = (quizType: QuizType, title: string) => {
    const lowerCaseTitle = title.toLowerCase();
    if (quizType === 'vocabulary') {
        if (lowerCaseTitle.includes('science')) return <ScienceIcon className='w-12 h-12 text-green-500' />;
        if (lowerCaseTitle.includes('history')) return <HistoryIcon className='w-12 h-12 text-yellow-500' />;
        if (lowerCaseTitle.includes('math')) return <MathIcon className='w-12 h-12 text-purple-500' />;
    }
    return <BookOpen className='w-12 h-12 text-gray-400' />;
}


function AdminDashboard({ user }: { user: AppUser }) {
    const [data, setData] = useState<{ children: ChildWithAttempts[], quizzes: Quiz[] }>({ children: [], quizzes: [] });
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchDashboardData = useCallback(async () => {
        setIsLoading(true);
        const result = await getDashboardDataAction();
        if (result.children && result.quizzes) {
            setData({ children: result.children, quizzes: result.quizzes });
        } else if (result.error) {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        }
        setIsLoading(false);
    }, [toast]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);
    
    return (
        <div className="space-y-12">
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-bold font-headline">My Quizzes</h1>
                </div>
                 {isLoading ? (
                     <div className="text-center"><LoaderCircle className="w-8 h-8 animate-spin text-primary mx-auto" /></div>
                ) : data.quizzes.length === 0 ? (
                     <Card className="text-center py-12">
                        <CardHeader>
                            <CardTitle>Create your first quiz!</CardTitle>
                            <CardDescription>Click the "Create Quiz" button in the header to get started.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Button asChild>
                                <Link href="/create-quiz">
                                    <PlusCircle />
                                    Create Quiz
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data.quizzes.map((quiz) => (
                            <Card key={quiz.id} className="flex flex-col">
                                <CardHeader>
                                    <CardTitle>{quiz.title}</CardTitle>
                                    <CardDescription>{quiz.flashcards.length} flashcards</CardDescription>
                                </CardHeader>
                                <CardFooter className="mt-auto flex justify-end gap-2">
                                    <Button asChild variant="outline">
                                        <Link href={`/quiz/${quiz.id}`}><Eye className="mr-2" /> View</Link>
                                    </Button>
                                    <Button asChild>
                                        <Link href={`/quiz/${quiz.id}`}><Play className="mr-2"/> Start Quiz</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-3xl font-bold font-headline">Child Activity</h2>
                    <div className="flex gap-2">
                        <AddChildDialog onChildAdded={fetchDashboardData} />
                        <AddParentDialog onParentAdded={() => {}} />
                    </div>
                </div>
                 {isLoading ? (
                    <div className="text-center">
                        <LoaderCircle className="w-8 h-8 animate-spin text-primary mx-auto" />
                    </div>
                ) : data.children.length === 0 ? (
                    <Card className="text-center py-12">
                        <CardHeader>
                            <CardTitle>No children found</CardTitle>
                            <CardDescription>Click the button to add your first child and see their progress.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AddChildDialog onChildAdded={fetchDashboardData} />
                        </CardContent>
                    </Card>
                ) : (
                    <Accordion type="single" collapsible className="w-full">
                        {data.children.map(child => (
                            <AccordionItem value={child.uid} key={child.uid}>
                                <AccordionTrigger className="text-xl font-headline">{child.email}</AccordionTrigger>
                                <AccordionContent>
                                    {child.attempts.length > 0 ? (
                                        <div className="space-y-2">
                                            <h4 className="font-semibold">Recent Quiz History:</h4>
                                            <ul className='list-disc pl-5'>
                                                {child.attempts.slice(0, 5).map(attempt => (
                                                    <li key={attempt.id} className="text-sm text-muted-foreground">
                                                        {formatDistanceToNow(new Date(attempt.completedAt.seconds * 1000), { addSuffix: true })} - 
                                                        "{attempt.quizTitle}": {attempt.score}/{attempt.totalQuestions}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground">No quiz attempts recorded yet.</p>
                                    )}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                )}
            </div>
        </div>
    );
}


function ChildDashboard({ user }: { user: AppUser }) {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [achievements, setAchievements] = useState<UserAchievement[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsFetching(true);
            const [dashboardResult, quizzesResult] = await Promise.all([
                getDashboardDataAction(),
                getQuizzesAction()
            ]);
    
            if (dashboardResult.quizzes) setQuizzes(dashboardResult.quizzes);
            if (dashboardResult.achievements) setAchievements(dashboardResult.achievements);
    
            if (dashboardResult.error) {
                toast({ variant: 'destructive', title: 'Error', description: dashboardResult.error });
            }
            
            if (quizzesResult.error) {
                toast({ variant: 'destructive', title: 'Error fetching quizzes', description: quizzesResult.error });
            } else if (quizzesResult.quizzes) {
                setQuizzes(quizzesResult.quizzes);
            }
            
            if (quizzesResult.quizzes?.length === 0 && user.role === 'child' && !user.parentId) {
                toast({ variant: 'default', title: 'Welcome!', description: 'Please ask your parent to add you to their account to see quizzes.' });
            }

            setIsFetching(false);
        };
        fetchDashboardData();
    }, [user, toast]);

    const unlockedAchievementMap = new Map(achievements.map(a => [a.achievementId, a]));

    return (
         <div className='space-y-12'>
            <div>
                <h1 className="text-3xl font-bold font-headline mb-4">My Achievements</h1>
                <Card>
                    <CardContent className="p-6">
                        {isFetching ? (
                             <div className="text-center"><LoaderCircle className="w-8 h-8 animate-spin text-primary mx-auto" /></div>
                        ) : (
                             <TooltipProvider>
                                <div className="flex flex-wrap gap-4">
                                {ALL_ACHIEVEMENTS.map(ach => {
                                    const unlocked = unlockedAchievementMap.get(ach.id);
                                    const Icon = ach.icon;
                                    return (
                                        <Tooltip key={ach.id}>
                                            <TooltipTrigger>
                                                <div className={`p-3 rounded-full border-2 ${unlocked ? 'bg-amber-100 border-amber-400' : 'bg-muted border-border'}`}>
                                                    <Icon className={`w-8 h-8 ${unlocked ? 'text-amber-500' : 'text-muted-foreground'}`} />
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="font-bold">{ach.name}</p>
                                                <p>{ach.description}</p>
                                                {unlocked && (
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Unlocked {formatDistanceToNow(new Date(unlocked.unlockedAt.seconds * 1000), { addSuffix: true })}
                                                    </p>
                                                )}
                                            </TooltipContent>
                                        </Tooltip>
                                    )
                                })}
                                </div>
                            </TooltipProvider>
                        )}
                    </CardContent>
                </Card>
            </div>
            <div>
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold font-headline">Your Quizzes</h1>
                </div>

                {isFetching ? (
                    <div className="text-center">
                        <LoaderCircle className="w-8 h-8 animate-spin text-primary mx-auto" />
                        <p className="mt-2 text-muted-foreground">Fetching your quizzes...</p>
                    </div>
                ) : quizzes.length === 0 ? (
                    <Card className="text-center py-12">
                        <CardHeader className="items-center">
                            <BookOpen className="w-16 h-16 text-muted-foreground mb-4" />
                            <CardTitle>No quizzes yet!</CardTitle>
                            <CardDescription>Once your parent creates a quiz, it will appear here.</CardDescription>
                        </CardHeader>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {quizzes.map((quiz) => (
                            <Card key={quiz.id} className="flex flex-col hover:shadow-lg transition-shadow">
                                <CardHeader className="flex-row items-center gap-4 space-y-0">
                                    {getQuizIcon(quiz.quizType, quiz.title)}
                                    <div className="flex-1">
                                        <CardTitle className="text-lg">{quiz.title}</CardTitle>
                                        <CardDescription>{quiz.flashcards.length} flashcards</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardFooter className="mt-auto pt-4 flex justify-end gap-2">
                                    <Button asChild className="w-full">
                                        <Link href={`/quiz/${quiz.id}`}>
                                            <Play />
                                            Start Quiz
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function DashboardPage() {
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
          Loading Dashboard...
        </h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        {user.role === 'admin' ? <AdminDashboard user={user} /> : <ChildDashboard user={user} />}
      </main>
    </div>
  );
}

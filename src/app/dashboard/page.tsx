
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoaderCircle, Play, Eye, BookOpen, User } from 'lucide-react';
import { getDashboardDataAction } from '@/app/actions';
import type { Quiz, AppUser, QuizAttempt, QuizType, UserAchievement } from '@/lib/types';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';
import ScienceIcon from '@/components/icons/ScienceIcon';
import HistoryIcon from '@/components/icons/HistoryIcon';
import MathIcon from '@/components/icons/MathIcon';
import { ALL_ACHIEVEMENTS } from '@/lib/achievements';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

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


function ParentDashboard({ user }: { user: AppUser }) {
    const [data, setData] = useState<{ children: ChildWithAttempts[], quizzes: Quiz[] }>({ children: [], quizzes: [] });
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchDashboardData = useCallback(async () => {
        console.log('[ParentDashboard] Fetching dashboard data...');
        setIsLoading(true);
        const result = await getDashboardDataAction();
        if (result.error) {
            console.error('[ParentDashboard] Error fetching data:', result.error);
            toast({ variant: 'destructive', title: 'Error', description: result.error });
            setData({ children: [], quizzes: [] });
        } else {
            console.log('[ParentDashboard] Data fetched successfully:', result);
            setData({ 
                children: (result.children as ChildWithAttempts[]) || [], 
                quizzes: result.quizzes || [] 
            });
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
                </div>
                 {isLoading ? (
                    <div className="text-center">
                        <LoaderCircle className="w-8 h-8 animate-spin text-primary mx-auto" />
                    </div>
                ) : data.children.length === 0 ? (
                    <Card className="text-center py-12">
                        <CardHeader>
                            <CardTitle>No children found</CardTitle>
                            <CardDescription>Add a child account via the Settings page to see their progress.</CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Button asChild className="mx-auto">
                                <Link href="/settings">Go to Settings</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ) : (
                    <Carousel
                        opts={{
                            align: 'start',
                        }}
                        className="w-full"
                        >
                        <CarouselContent>
                            {data.children.map(child => {
                                const chartData = child.attempts.slice(0, 5).reverse().map(attempt => ({
                                    name: format(new Date(attempt.completedAt.seconds * 1000), 'MMM d'),
                                    score: (attempt.score / attempt.totalQuestions) * 100,
                                    quizTitle: attempt.quizTitle
                                }));

                                return (
                                <CarouselItem key={child.uid} className="md:basis-1/2 lg:basis-1/3">
                                    <div className="p-1">
                                    <Card>
                                        <CardHeader>
                                                <CardTitle className="flex items-center gap-2 font-headline">
                                                    <User className="text-primary"/>
                                                    {child.name || child.email}
                                                </CardTitle>
                                                <CardDescription>
                                                    {child.attempts.length > 0 ? `Last active: ${formatDistanceToNow(new Date(child.attempts[0].completedAt.seconds * 1000), { addSuffix: true })}` : 'No activity yet.'}
                                                </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                                {child.attempts.length > 0 ? (
                                                    <ChartContainer config={{
                                                        score: {
                                                          label: 'Score',
                                                          color: 'hsl(var(--primary))',
                                                        },
                                                      }} className="h-48 w-full">
                                                        <BarChart accessibilityLayer data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                                                            <CartesianGrid vertical={false} />
                                                            <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                                                            <YAxis domain={[0, 100]} unit="%" />
                                                            <ChartTooltip
                                                                cursor={false}
                                                                content={({ active, payload, label }) => active && payload?.length && (
                                                                    <div className="bg-background p-2 shadow-lg rounded-lg border">
                                                                        <p className="font-bold">{label}</p>
                                                                        <p className="text-sm text-muted-foreground">{payload[0].payload.quizTitle}</p>
                                                                        <p className="text-sm" style={{ color: 'hsl(var(--primary))' }}>Score: {Math.round(payload[0].value as number)}%</p>
                                                                    </div>
                                                                )}
                                                            />
                                                            <Bar dataKey="score" fill="var(--color-score)" radius={4} />
                                                        </BarChart>
                                                    </ChartContainer>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground">
                                                        <BookOpen className="w-12 h-12 mb-2" />
                                                        <p>No quiz attempts recorded yet.</p>
                                                    </div>
                                                )}
                                        </CardContent>
                                    </Card>
                                    </div>
                                </CarouselItem>
                            )})}
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                    </Carousel>
                )}
            </div>
        </div>
    );
}


function ChildDashboard({ user }: { user: AppUser }) {
    const [data, setData] = useState<{ quizzes: Quiz[], achievements: UserAchievement[], attempts: QuizAttempt[] }>({ quizzes: [], achievements: [], attempts: [] });
    const [isFetching, setIsFetching] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchDashboardData = async () => {
            console.log('[ChildDashboard] Fetching dashboard data...');
            setIsFetching(true);
            const result = await getDashboardDataAction();
    
            if (result.error) {
                console.error('[ChildDashboard] Error fetching data:', result.error);
                toast({ variant: 'destructive', title: 'Error', description: result.error });
                 setData({ quizzes: [], achievements: [], attempts: [] });
            } else {
                console.log('[ChildDashboard] Data fetched successfully:', result);
                setData({
                    quizzes: result.quizzes || [],
                    achievements: result.achievements || [],
                    attempts: result.attempts || []
                });
            }
            
            if (user.role === 'child' && !user.parentId && (!result.quizzes || result.quizzes.length === 0)) {
                console.log('[ChildDashboard] Standalone child detected, showing welcome toast.');
                toast({ variant: 'default', title: 'Welcome!', description: 'Please ask your parent to add you to their account to see quizzes.' });
            }

            setIsFetching(false);
        };
        fetchDashboardData();
    }, [user, toast]);

    const unlockedAchievementMap = new Map(data.achievements.map(a => [a.achievementId, a]));

    return (
         <div className='space-y-12'>
            <div>
                <h1 className="text-3xl font-bold font-headline mb-4">My Achievements</h1>
                <Card>
                    <CardContent className="p-6">
                        {isFetching ? (
                             <div className="text-center"><LoaderCircle className="w-8 h-8 animate-spin text-primary mx-auto" /></div>
                        ) : ALL_ACHIEVEMENTS.length === 0 ? (
                            <p className="text-muted-foreground text-center">No achievements available yet.</p>
                        ) : (
                             <TooltipProvider>
                                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
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
                ) : data.quizzes.length === 0 ? (
                    <Card className="text-center py-12">
                        <CardHeader className="items-center">
                            <BookOpen className="w-16 h-16 text-muted-foreground mb-4" />
                            <CardTitle>No quizzes yet!</CardTitle>
                            <CardDescription>Once your parent creates a quiz, it will appear here.</CardDescription>
                        </CardHeader>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data.quizzes.map((quiz) => (
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <LoaderCircle className="w-12 h-12 animate-spin text-primary mb-4" />
        <h1 className="text-2xl font-bold font-headline text-primary-foreground">
          Loading Dashboard...
        </h1>
      </div>
    );
  }

  if (!user) {
    // This should ideally not be reached if the layout/route handles auth properly,
    // but it's a good failsafe.
    router.push('/login');
    return null; // Render nothing while redirecting
  }

  console.log(`[DashboardPage] Rendering dashboard for user ${user.uid} with role ${user.role}`);
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        {user.role === 'parent' ? <ParentDashboard user={user} /> : <ChildDashboard user={user} />}
      </main>
    </div>
  );
}

    
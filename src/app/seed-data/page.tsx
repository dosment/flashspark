
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { preloadedQuizzes } from '@/lib/preloaded-data';
import { db } from '@/lib/firebase';
import { collection, writeBatch, doc } from 'firebase/firestore';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

export default function SeedDataPage() {
    const [isSeeding, setIsSeeding] = useState(false);
    const { toast } = useToast();
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && (!user || user.role !== 'admin')) {
            toast({ variant: 'destructive', title: 'Unauthorized', description: 'You do not have permission to view this page.' });
            router.push('/dashboard');
        }
    }, [user, loading, router, toast]);

    const handleSeedData = async () => {
        setIsSeeding(true);
        try {
            const batch = writeBatch(db);
            const preloadedQuizzesRef = collection(db, 'preloadedQuizzes');

            preloadedQuizzes.forEach((quiz) => {
                const docRef = doc(preloadedQuizzesRef); // Use doc() to create a reference with a new ID
                const quizData = {
                    title: quiz.title,
                    flashcards: quiz.flashcards,
                    quizType: 'vocabulary'
                }
                batch.set(docRef, quizData);
            });

            await batch.commit();

            toast({
                title: 'Success!',
                description: `Successfully seeded ${preloadedQuizzes.length} pre-loaded quizzes to the database. You can now remove the src/app/seed-data page.`,
            });
        } catch (error) {
            console.error('Error seeding data:', error);
            toast({
                variant: 'destructive',
                title: 'Error Seeding Data',
                description: 'Could not seed the database. Check the console for details.',
            });
        }
        setIsSeeding(false);
    };

    if (loading || !user) {
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
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="container mx-auto px-4 py-8 md:py-12 flex items-center justify-center">
                <Card className="w-full max-w-xl">
                    <CardHeader>
                        <CardTitle className="text-2xl font-headline">Seed Pre-loaded Quizzes</CardTitle>
                        <CardDescription>
                            This is a one-time action. Click the button below to populate the Firestore database
                            with the pre-loaded science quizzes from the static file. Once this is done, you
                            can safely delete the `src/app/seed-data` directory.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            onClick={handleSeedData}
                            disabled={isSeeding}
                            className="w-full"
                            size="lg"
                        >
                            {isSeeding ? <LoaderCircle className="animate-spin" /> : 'Seed Database Now'}
                        </Button>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

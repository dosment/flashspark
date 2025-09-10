
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, LayoutDashboard, Rocket } from 'lucide-react';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/use-auth';

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12 flex items-center">
        <section className="text-center w-full">
          <Rocket className="h-24 w-24 mx-auto text-accent animate-bounce" />
          <h1 className="text-4xl md:text-6xl font-bold font-headline text-primary-foreground tracking-tight mt-4">
            Ready to Ace Your Next Quiz?
          </h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            All your quizzes are waiting for you on your dashboard. Let's get started!
          </p>
          <div className="mt-8 flex justify-center items-center gap-4">
            <Button asChild size="lg">
              <Link href="/dashboard">
                <LayoutDashboard className="mr-2" />
                Go to My Dashboard
                <ArrowRight className="ml-2" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <footer className="text-center py-4 text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} FlashSpark. All rights reserved.</p>
      </footer>
    </div>
  );
}

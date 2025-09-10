
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, LayoutDashboard, Rocket, LogIn } from 'lucide-react';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/use-auth';
import { LoaderCircle } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();

  const renderCTA = () => {
    if (loading) {
      return <LoaderCircle className="w-8 h-8 animate-spin text-primary" />;
    }
    if (user) {
      return (
        <Button asChild size="lg">
          <Link href="/dashboard">
            <LayoutDashboard className="mr-2" />
            Go to My Dashboard
            <ArrowRight className="ml-2" />
          </Link>
        </Button>
      );
    }
    return (
      <Button asChild size="lg">
        <Link href="/login">
          <LogIn className="mr-2" />
          Get Started for Free
          <ArrowRight className="ml-2" />
        </Link>
      </Button>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12 flex items-center">
        <section className="text-center w-full">
          <Rocket className="h-24 w-24 mx-auto text-accent animate-bounce" />
          <h1 className="text-4xl md:text-6xl font-bold font-headline text-primary-foreground tracking-tight mt-4">
            Ignite Your Mind, One Card at a Time.
          </h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            FlashSpark is the fun, AI-powered way for kids to create and share quizzes, turning study time into playtime.
          </p>
          <div className="mt-8 flex justify-center items-center gap-4">
            {renderCTA()}
          </div>
        </section>
      </main>
      <footer className="text-center py-4 text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} FlashSpark. All rights reserved.</p>
      </footer>
    </div>
  );
}

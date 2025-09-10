
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LoaderCircle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ALL_AVATARS, getAvatar } from '@/lib/avatars';
import { updateUserProfile } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const { user, firebaseUser, loading, logOut } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.push('/login');
    }
  }, [firebaseUser, loading, router]);

  const handleLogout = async () => {
    await logOut();
    router.push('/');
  };

  const handleSelectAvatar = async (avatarId: string) => {
    if (!user || isSaving) return;
    setIsSaving(true);
    try {
        await updateUserProfile(user.uid, { avatarId });
        toast({
            title: "Avatar Updated!",
            description: "Your new avatar has been saved.",
        });
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Save Failed",
            description: "Could not update your avatar. Please try again."
        });
    } finally {
        setIsSaving(false);
    }
  };

  if (loading || !firebaseUser || !user) {
    return (
       <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <LoaderCircle className="w-12 h-12 animate-spin text-primary mb-4" />
        <h1 className="text-2xl font-bold font-headline text-primary-foreground">
          Loading Profile...
        </h1>
      </div>
    );
  }
  
  const CurrentAvatar = getAvatar(user.avatarId);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-2xl mx-auto space-y-8">
            <Card>
            <CardHeader className="items-center text-center">
                {CurrentAvatar ? (
                    <CurrentAvatar className="w-24 h-24 mb-4" />
                ) : (
                    <Avatar className="w-24 h-24 mb-4">
                        <AvatarFallback className="text-3xl">
                            {user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                )}
                <CardTitle className="text-3xl">{user.email}</CardTitle>
                <Badge className='capitalize' variant={user.role === 'admin' ? 'default' : 'secondary'}>{user.role}</Badge>
            </CardHeader>
            <CardFooter className="flex justify-center">
                <Button onClick={handleLogout} variant="destructive">Log Out</Button>
            </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Choose Your Avatar</CardTitle>
                    <CardDescription>Click an avatar to make it your own!</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
                        {ALL_AVATARS.map(({ id, component: AvatarComponent }) => (
                            <button
                                key={id}
                                onClick={() => handleSelectAvatar(id)}
                                disabled={isSaving}
                                className={cn(
                                    "relative p-2 rounded-full aspect-square flex items-center justify-center transition-all duration-200 group",
                                    user.avatarId === id ? "bg-primary/20 ring-2 ring-primary" : "hover:bg-accent/50",
                                    isSaving && user.avatarId !== id && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                <AvatarComponent className="w-full h-full transition-transform duration-200 group-hover:scale-110" />
                                {user.avatarId === id && (
                                    <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5 border-2 border-background">
                                        <CheckCircle className="w-4 h-4 text-white" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}

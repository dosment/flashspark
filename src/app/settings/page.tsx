
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LoaderCircle, CheckCircle, Award, User, Users, ShieldPlus, UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ALL_AVATARS, getAvatar } from '@/lib/avatars';
import { updateUserProfile } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { getDashboardDataAction, getManagedUsersAction } from '../actions';
import { UserAchievement, AppUser } from '@/lib/types';
import { ALL_ACHIEVEMENTS } from '@/lib/achievements';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AddChildDialog } from '@/components/AddChildDialog';
import { AddParentDialog } from '@/components/AddParentDialog';

function ProfileTab() {
  const { user, logOut } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [isFetchingAchievements, setIsFetchingAchievements] = useState(true);

  useEffect(() => {
    async function fetchAchievements() {
        if (!user) return;
        setIsFetchingAchievements(true);
        const result = await getDashboardDataAction();
        if (result.achievements) {
            setAchievements(result.achievements);
        }
        setIsFetchingAchievements(false);
    }
    fetchAchievements();
  }, [user]);

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
  
  if (!user) return null;
  
  const CurrentAvatar = getAvatar(user.avatarId);
  const unlockedAchievementMap = new Map(achievements.map(a => [a.achievementId, a]));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
            <Card>
                <CardHeader className="items-center text-center">
                    {CurrentAvatar ? (
                        <CurrentAvatar className="w-32 h-32 mb-4" />
                    ) : (
                        <Avatar className="w-32 h-32 mb-4">
                            <AvatarFallback className="text-5xl">
                                {user.email?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    )}
                    <CardTitle className="text-3xl">{user.email}</CardTitle>
                    <div className="flex items-center gap-2">
                       <Badge className='capitalize' variant={user.role === 'admin' ? 'default' : 'secondary'}>{user.role}</Badge>
                       {user.gradeLevel && <Badge variant="outline">{user.gradeLevel}</Badge>}
                    </div>
                </CardHeader>
                <CardFooter className="flex justify-center">
                    <Button onClick={handleLogout} variant="destructive">Log Out</Button>
                </CardFooter>
            </Card>

            {user.role === 'child' && (
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="text-amber-500"/>
                            My Achievements
                        </CardTitle>
                        <CardDescription>Your collection of unlocked milestones.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         {isFetchingAchievements ? (
                            <div className="flex justify-center items-center p-4">
                                <LoaderCircle className="animate-spin text-primary" />
                            </div>
                        ) : achievements.length > 0 ? (
                            <TooltipProvider>
                                <div className="flex flex-wrap gap-4">
                                {ALL_ACHIEVEMENTS.map(ach => {
                                    const unlocked = unlockedAchievementMap.get(ach.id);
                                    if (!unlocked) return null;
                                    const Icon = ach.icon;
                                    return (
                                        <Tooltip key={ach.id}>
                                            <TooltipTrigger>
                                                <div className={`p-3 rounded-full border-2 bg-amber-100 border-amber-400`}>
                                                    <Icon className={`w-8 h-8 text-amber-500`} />
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
                        ): (
                            <p className='text-sm text-muted-foreground'>No achievements unlocked yet. Keep taking quizzes!</p>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
        
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Choose Your Avatar</CardTitle>
                    <CardDescription>Click an avatar to make it your own! They have subtle animations.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4">
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
    </div>
  );
}


function UserManagementTab() {
  const [users, setUsers] = useState<{ children: AppUser[] }>({ children: [] });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    const result = await getManagedUsersAction();
    if (result.error) {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    } else if (result.children) {
      setUsers({ children: result.children });
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  const { children } = users;

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          Manage child accounts linked to you and add other parents.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Child Accounts</h3>
            <AddChildDialog onChildAdded={fetchUsers} />
          </div>
          {isLoading ? (
             <div className="flex justify-center items-center p-4">
                <LoaderCircle className="animate-spin text-primary" />
            </div>
          ) : children.length > 0 ? (
            <div className="border rounded-md">
                {children.map((child, index) => {
                    const ChildAvatar = getAvatar(child.avatarId);
                    return (
                        <div key={child.uid} className={cn("flex items-center gap-4 p-4", index !== children.length -1 && 'border-b')}>
                            <Avatar>
                                {ChildAvatar ? <ChildAvatar /> : <AvatarFallback>{child.email?.[0].toUpperCase()}</AvatarFallback>}
                            </Avatar>
                            <div className='flex-1'>
                                <p className='font-medium'>{child.email}</p>
                                <p className='text-sm text-muted-foreground'>
                                    Role: <Badge variant='secondary' className='capitalize'>{child.role}</Badge>
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground p-8 border rounded-md border-dashed">
                <p>You haven't added any child accounts yet.</p>
                <p>Click "Add Child" to link their account.</p>
            </div>
          )}
        </div>
        <div className="space-y-4">
           <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Parent Accounts</h3>
            <AddParentDialog onParentAdded={() => {}} />
          </div>
           <p className="text-sm text-muted-foreground">
            You can grant parent/admin permissions to other users. They will be able to create quizzes and manage children.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}


export default function SettingsPage() {
  const { user, firebaseUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.push('/login');
    }
  }, [firebaseUser, loading, router]);

  if (loading || !user) {
    return (
       <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <LoaderCircle className="w-12 h-12 animate-spin text-primary mb-4" />
        <h1 className="text-2xl font-bold font-headline text-primary-foreground">
          Loading Settings...
        </h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <h1 className="text-3xl font-bold font-headline mb-8">Settings</h1>

        {user.role === 'admin' ? (
           <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="profile"><User className='mr-2'/> Profile</TabsTrigger>
              <TabsTrigger value="users"><Users className='mr-2' /> User Management</TabsTrigger>
            </TabsList>
            <TabsContent value="profile" className="mt-6">
              <ProfileTab />
            </TabsContent>
            <TabsContent value="users" className="mt-6">
              <UserManagementTab />
            </TabsContent>
          </Tabs>
        ) : (
            // Child view has no tabs, just profile
            <ProfileTab />
        )}
      </main>
    </div>
  );
}

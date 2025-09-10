
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LoaderCircle, CheckCircle, Award, User, Users, Calendar, Mail, GraduationCap, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ALL_AVATARS, getAvatar } from '@/lib/avatars';
import { updateUserProfile } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { getDashboardDataAction, getManagedUsersAction } from '../actions';
import { UserAchievement, AppUser } from '@/lib/types';
import { ALL_ACHIEVEMENTS } from '@/lib/achievements';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format, formatDistanceToNow } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AddChildDialog } from '@/components/AddChildDialog';
import { AddParentDialog } from '@/components/AddParentDialog';

function ProfileTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [isFetchingAchievements, setIsFetchingAchievements] = useState(true);

  useEffect(() => {
    async function fetchAchievements() {
        if (!user || user.role !== 'child') {
            setIsFetchingAchievements(false);
            return;
        };
        console.log('[ProfileTab] Fetching achievements for child user.');
        setIsFetchingAchievements(true);
        const result = await getDashboardDataAction();
        if (result.achievements) {
            setAchievements(result.achievements);
            console.log(`[ProfileTab] Found ${result.achievements.length} achievements.`);
        } else {
             console.error('[ProfileTab] Error fetching achievements:', result.error);
        }
        setIsFetchingAchievements(false);
    }
    fetchAchievements();
  }, [user]);

  const handleSelectAvatar = async (avatarId: string) => {
    if (!user || isSaving) return;
    console.log(`[ProfileTab] User ${user.uid} selected new avatar: ${avatarId}`);
    setIsSaving(true);
    try {
        await updateUserProfile(user.uid, { avatarId });
        toast({
            title: "Avatar Updated!",
            description: "Your new avatar has been saved.",
        });
         console.log(`[ProfileTab] Avatar updated successfully.`);
    } catch (error) {
         console.error(`[ProfileTab] Error updating avatar:`, error);
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
                                {user.name ? user.name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    )}
                    <CardTitle className="text-3xl">{user.name || user.email}</CardTitle>
                    <div className="flex items-center gap-2">
                       <Badge className='capitalize' variant={user.role === 'parent' ? 'default' : 'secondary'}>{user.role}</Badge>
                       {user.gradeLevel && <Badge variant="outline">{user.gradeLevel}</Badge>}
                    </div>
                </CardHeader>
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


function UserManagementTab({ onUsersChanged }: { onUsersChanged: () => void }) {
  const [users, setUsers] = useState<{ children: AppUser[], parents: AppUser[] }>({ children: [], parents: [] });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    console.log('[UserManagementTab] Fetching managed users...');
    setIsLoading(true);
    const result = await getManagedUsersAction();
    if (result.error) {
      console.error('[UserManagementTab] Error fetching users:', result.error);
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    } else {
      console.log(`[UserManagementTab] Found ${result.children?.length || 0} children and ${result.parents?.length || 0} parents.`);
      setUsers({ children: result.children || [], parents: result.parents || [] });
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  const handleUserAdded = () => {
      console.log('[UserManagementTab] User added/changed, triggering refetch.');
      fetchUsers();
      onUsersChanged();
  }

  const { children, parents } = users;

  const UserListItem = ({ user }: { user: AppUser }) => {
    const UserAvatar = getAvatar(user.avatarId);
    return (
        <div className={cn("flex items-start gap-4 p-4")}>
            <Avatar className="mt-1">
                {UserAvatar ? <UserAvatar /> : <AvatarFallback>{user.name ? user.name[0] : user.email?.[0].toUpperCase()}</AvatarFallback>}
            </Avatar>
            <div className='flex-1 flex flex-col md:flex-row md:flex-wrap gap-x-4 gap-y-1'>
                <div className="font-semibold text-lg md:w-full md:col-span-2">{user.name || 'No Name'}</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground break-all">
                    <Mail className="w-4 h-4 flex-shrink-0"/>
                    <span>{user.email}</span>
                </div>
                 {user.role === 'child' && (
                     <>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <GraduationCap className="w-4 h-4 flex-shrink-0"/>
                            <span>{user.gradeLevel || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4 flex-shrink-0"/>
                            <span>Born: {user.dateOfBirth ? format(new Date(user.dateOfBirth), 'PPP') : 'N/A'}</span>
                        </div>
                     </>
                 )}
                 <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4 flex-shrink-0"/>
                    <p>
                        Last Login: {user.lastLogin && user.lastLogin !== 'N/A' ? formatDistanceToNow(new Date(user.lastLogin), { addSuffix: true }) : 'Never'}
                    </p>
                </div>
            </div>
        </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          Manage child accounts and other parent accounts in your group.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium flex items-center gap-2"><Users />Child Accounts</h3>
            <AddChildDialog onChildAdded={handleUserAdded} />
          </div>
          {isLoading ? (
             <div className="flex justify-center items-center p-4">
                <LoaderCircle className="animate-spin text-primary" />
            </div>
          ) : children.length > 0 ? (
            <div className="border rounded-md divide-y">
                {children.map((child) => <UserListItem key={child.uid} user={child} />)}
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
            <h3 className="text-lg font-medium flex items-center gap-2"><Shield />Parent Accounts</h3>
            <AddParentDialog onParentAdded={handleUserAdded} />
          </div>
           {isLoading ? (
             <div className="flex justify-center items-center p-4">
                <LoaderCircle className="animate-spin text-primary" />
            </div>
          ) : parents.length > 0 ? (
            <div className="border rounded-md divide-y">
                {parents.map((parent) => <UserListItem key={parent.uid} user={parent} />)}
            </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground p-8 border rounded-md border-dashed">
                <p>You are the only parent in this group.</p>
                <p>Click "Add Parent" to invite another parent.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleUsersChanged = useCallback(() => {
    console.log("[SettingsPage] A user was added/changed, dashboard data should be refreshed if it were visible.");
  }, []);

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
          Loading Settings...
        </h1>
      </div>
    );
  }
   console.log(`[SettingsPage] Rendering settings for user ${user.uid} with role ${user.role}`);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <h1 className="text-3xl font-bold font-headline mb-8">Settings</h1>

        {user.role === 'parent' ? (
           <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="profile"><User className='mr-2'/> Profile</TabsTrigger>
              <TabsTrigger value="users"><Users className='mr-2' /> User Management</TabsTrigger>
            </TabsList>
            <TabsContent value="profile" className="mt-6">
              <ProfileTab />
            </TabsContent>
            <TabsContent value="users" className="mt-6">
              <UserManagementTab onUsersChanged={handleUsersChanged} />
            </TabsContent>
          </Tabs>
        ) : (
            <ProfileTab />
        )}
      </main>
      <footer className="text-center py-4 text-muted-foreground text-sm">
        &copy; {new Date().getFullYear()} FlashSpark. All rights reserved.
      </footer>
    </div>
  );
}

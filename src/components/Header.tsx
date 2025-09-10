
'use client';

import Link from 'next/link';
import { BrainCircuit, LogIn, LogOut, User, LayoutDashboard, PlusCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback } from './ui/avatar';
import { usePathname } from 'next/navigation';
import { getAvatar } from '@/lib/avatars';

export default function Header() {
  const { user, loading, logOut } = useAuth();
  const pathname = usePathname();

  const UserAvatar = user ? getAvatar(user.avatarId) : null;
  const homeHref = user ? '/dashboard' : '/';

  return (
    <header className="py-4 px-6 border-b">
      <div className="container mx-auto flex items-center justify-between">
        <Link
          href={homeHref}
          className="flex items-center gap-2 text-2xl font-bold font-headline text-primary-foreground"
        >
          <BrainCircuit className="h-8 w-8 text-primary" />
          <span>FlashSpark</span>
        </Link>

        <div className="flex items-center gap-4">
          {!loading && user && (
              <>
                {user.role === 'admin' ? (
                  <>
                    <Button asChild>
                      <Link href="/create-quiz">
                        <PlusCircle className="mr-2" />
                        Create Quiz
                      </Link>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                          <Avatar className="h-10 w-10">
                            {UserAvatar ? (
                              <UserAvatar className="w-full h-full" />
                            ) : (
                              <AvatarFallback>
                                {user.email?.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {user.email}
                            </p>                         
                            <p className="text-xs leading-none text-muted-foreground capitalize">
                              {user.role}
                            </p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                         <DropdownMenuItem asChild>
                          <Link href="/dashboard">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            <span>Dashboard</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/profile">
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={logOut}>
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Log out</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : (
                  // Child View
                  <div className="flex items-center gap-2">
                     <Button asChild variant="secondary">
                        <Link href="/dashboard">
                          <LayoutDashboard className="mr-2" /> My Quizzes
                        </Link>
                     </Button>
                     <Button asChild variant="ghost" className="relative h-10 w-10 rounded-full">
                       <Link href="/profile">
                          <Avatar className="h-10 w-10">
                            {UserAvatar ? (
                              <UserAvatar className="w-full h-full" />
                            ) : (
                              <AvatarFallback>
                                {user.email?.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                       </Link>
                     </Button>
                  </div>
                )}
              </>
            )}
        </div>
      </div>
    </header>
  );
}

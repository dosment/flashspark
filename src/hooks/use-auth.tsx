
'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from 'react';
import {
  onAuthStateChanged,
  User as FirebaseAuthUser,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { AuthContextType, AppUser } from '@/lib/types';
import { doc, getDoc, setDoc, onSnapshot, collection, getDocs, query, where, FirestoreError } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from './use-toast';


const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function createUserProfile(firebaseUser: FirebaseAuthUser): Promise<AppUser> {
    try {
        const newUser: AppUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email!.toLowerCase(),
            role: 'admin', // New users default to parent/admin.
            avatarId: 'avatar-1'
        };
        
        await setDoc(doc(db, 'users', firebaseUser.uid), newUser, { merge: true });
        console.log('Created new user profile:', newUser);
        return newUser;
    } catch(error) {
        console.error("Error creating user profile:", error);
         if (error instanceof FirestoreError) {
            throw new Error(`Could not connect to the database to create a user profile. (Code: ${error.code})`);
        }
        throw new Error("An unknown error occurred while creating your user profile.");
    }
}


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseAuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        setFirebaseUser(fbUser);
        if (fbUser) {
            try {
                console.log('handleUser: Firebase user found. Setting up session and profile listener...');
                const idToken = await fbUser.getIdToken();
                await fetch('/api/auth/session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idToken }),
                });

                // Set up a real-time listener for the user's profile
                const userDocRef = doc(db, 'users', fbUser.uid);
                const unsubProfile = onSnapshot(userDocRef, async (userDoc) => {
                    if (userDoc.exists()) {
                        setUser(userDoc.data() as AppUser);
                        console.log('handleUser: User profile updated from snapshot:', userDoc.data());
                    } else {
                        console.log('handleUser: No profile found, creating one...');
                        const userProfile = await createUserProfile(fbUser);
                        setUser(userProfile);
                    }
                }, (error) => {
                    console.error("Error in profile snapshot listener:", error);
                    toast({
                        variant: 'destructive',
                        title: 'Connection Error',
                        description: `Could not sync your profile. (Code: ${error.code})`,
                    });
                    setUser(null);
                });

                // Return cleanup function for the profile listener
                return () => unsubProfile();

            } catch (error: any) {
                console.error('handleUser Error:', error);
                toast({
                    variant: 'destructive',
                    title: 'Authentication Error',
                    description: error.message || 'An unknown error occurred during authentication.',
                });
                setUser(null);
            } finally {
                setLoading(false);
            }
        } else {
            console.log('handleUser: No Firebase user. Clearing session.');
            await fetch('/api/auth/session', { method: 'DELETE' });
            setUser(null);
            setLoading(false);
        }
    });

    return () => unsubscribe();
  }, [toast]);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    try {
      await signInWithPopup(auth, provider);
      // The onAuthStateChanged listener will now take over.
      // We don't need to manually call it. The redirect will happen in the login page's useEffect.
      console.log('Google Sign-In successful. Waiting for auth state to propagate.');
    } catch (error: any) {
        console.error("Google Sign-In Error:", error);
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: error.message || 'An unexpected error occurred during sign-in.',
        });
    } finally {
        // Don't set loading to false here, because the onAuthStateChanged listener will do that
        // after it has finished fetching the user profile.
    }
  };

  const logOut = (): Promise<void> => {
    return signOut(auth).then(() => {
        router.push('/');
    });
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    signInWithGoogle,
    logOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

    
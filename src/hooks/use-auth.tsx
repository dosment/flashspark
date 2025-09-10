
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
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { useToast } from './use-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function createUserProfile(firebaseUser: FirebaseAuthUser): Promise<AppUser> {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
        return userDoc.data() as AppUser;
    }
    
    // New users always default to admin (parent) role.
    const newUser: AppUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!.toLowerCase(),
        role: 'admin', 
        avatarId: 'avatar-1'
    };
    
    await setDoc(userDocRef, newUser);
    return newUser;
}


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseAuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        setFirebaseUser(fbUser);
        if (fbUser) {
            try {
                const idToken = await fbUser.getIdToken();
                await fetch('/api/auth/session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idToken }),
                });

                const userDocRef = doc(db, 'users', fbUser.uid);
                const unsubProfile = onSnapshot(userDocRef, async (userDoc) => {
                    if (userDoc.exists()) {
                        setUser(userDoc.data() as AppUser);
                    } else {
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
                
                setLoading(false);
                return () => unsubProfile();

            } catch (error: any) {
                console.error('Auth State Change Error:', error);
                toast({
                    variant: 'destructive',
                    title: 'Authentication Error',
                    description: error.message || 'An unknown error occurred during authentication.',
                });
                setUser(null);
                setLoading(false);
            }
        } else {
            await fetch('/api/auth/session', { method: 'DELETE' });
            setUser(null);
            setFirebaseUser(null);
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
    } catch (error: any) {
        console.error("Google Sign-In Error:", error);
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: error.message || 'An unexpected error occurred during sign-in.',
        });
        setLoading(false); // Make sure loading stops on error
    }
  };

  const logOut = (): Promise<void> => {
    setLoading(true);
    return signOut(auth);
    // The onAuthStateChanged listener will handle the rest
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

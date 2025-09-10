
'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
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

async function checkUserProfile(firebaseUser: FirebaseAuthUser): Promise<AppUser> {
    console.log(`[AUTH] Checking user profile for UID: ${firebaseUser.uid}`);
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
        console.log(`[AUTH] User profile exists for UID: ${firebaseUser.uid}. Returning data.`);
        // Manually correct if the role is still 'admin' in the database
        const userData = userDoc.data() as AppUser;
        if (userData.role === 'admin') {
            console.log(`[AUTH] Found legacy 'admin' role for UID: ${firebaseUser.uid}. Correcting to 'parent' in component state.`);
            userData.role = 'parent';
        }
        return userData;
    }
    
    // This case should ideally not happen with the new parent-first creation flow.
    // However, it's a good failsafe. A user signing up without being created by a parent
    // will default to a parent role.
    console.warn(`[AUTH] No existing profile for ${firebaseUser.uid}. Creating new user with 'parent' role.`);
    const newUser: AppUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!.toLowerCase(),
        name: firebaseUser.displayName,
        role: 'parent', 
        avatarId: 'avatar-1'
    };
    
    await setDoc(userDocRef, newUser);
    console.log(`[AUTH] New user profile created and saved to Firestore.`);
    return newUser;
}


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseAuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    console.log('[AUTH] AuthProvider mounted. Setting up onAuthStateChanged listener.');
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        setLoading(true);
        console.log(`[AUTH] onAuthStateChanged triggered. Firebase user: ${fbUser ? fbUser.uid : 'null'}`);
        setFirebaseUser(fbUser);

        if (fbUser) {
            try {
                console.log('[AUTH] User is logged in. Fetching ID token and setting session cookie.');
                const idToken = await fbUser.getIdToken();
                await fetch('/api/auth/session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idToken }),
                });
                console.log('[AUTH] Session cookie set. Setting up Firestore profile listener.');

                const userDocRef = doc(db, 'users', fbUser.uid);
                const unsubProfile = onSnapshot(userDocRef, async (userDoc) => {
                    console.log(`[AUTH] Profile snapshot received for UID: ${fbUser.uid}. Document exists: ${userDoc.exists()}`);
                    if (userDoc.exists()) {
                        const userData = userDoc.data() as AppUser;
                        // Correct legacy 'admin' role on the fly
                        if (userData.role === 'admin') {
                            userData.role = 'parent';
                        }
                        setUser(userData);
                        console.log('[AUTH] AppUser state updated with profile data:', userData);
                    } else {
                        // This case handles a user signing up for the very first time, who wasn't pre-provisioned by a parent.
                        // They will default to a parent role.
                        console.log('[AUTH] Profile does not exist, checking/creating it...');
                        const userProfile = await checkUserProfile(fbUser);
                        setUser(userProfile);
                        console.log('[AUTH] AppUser state updated with new profile.');
                    }
                }, (error) => {
                    console.error("[AUTH] Error in profile snapshot listener:", error);
                    toast({
                        variant: 'destructive',
                        title: 'Connection Error',
                        description: `Could not sync your profile. (Code: ${error.code})`,
                    });
                    setUser(null);
                });
                
                setLoading(false);
                return () => {
                    console.log('[AUTH] Cleaning up profile snapshot listener.');
                    unsubProfile();
                };

            } catch (error: any) {
                console.error('[AUTH] Auth State Change Error:', error);
                toast({
                    variant: 'destructive',
                    title: 'Authentication Error',
                    description: error.message || 'An unknown error occurred during authentication.',
                });
                setUser(null);
                setLoading(false);
            }
        } else {
            console.log('[AUTH] User is logged out. Deleting session cookie and clearing user state.');
            await fetch('/api/auth/session', { method: 'DELETE' });
            setUser(null);
            setFirebaseUser(null);
            setLoading(false);
        }
    });

    return () => {
        console.log('[AUTH] Cleaning up onAuthStateChanged listener.');
        unsubscribe();
    }
  }, [toast]);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    console.log('[AUTH] Attempting to sign in with Google...');
    try {
      await signInWithPopup(auth, provider);
      console.log('[AUTH] Google Sign-In successful.');
      // onAuthStateChanged will handle the rest
    } catch (error: any) {
        console.error("[AUTH] Google Sign-In Error:", error);
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
    console.log('[AUTH] Logging out...');
    return signOut(auth);
    // The onAuthStateChanged listener will handle clearing local state.
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

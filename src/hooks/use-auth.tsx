
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
import { doc, getDoc, setDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { useToast } from './use-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function checkUserProfile(firebaseUser: FirebaseAuthUser): Promise<AppUser> {
    console.log(`[AUTH] checkUserProfile: Checking/creating profile for UID: ${firebaseUser.uid}`);
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
        const userData = userDoc.data() as AppUser;
        console.log(`[AUTH] checkUserProfile: Profile exists for UID: ${firebaseUser.uid}.`, userData);
        if (userData.role === 'admin') {
            console.warn(`[AUTH] checkUserProfile: Legacy 'admin' role found for ${firebaseUser.uid}. Treating as 'parent'.`);
            userData.role = 'parent';
        }
        return userData;
    }
    
    console.log(`[AUTH] checkUserProfile: No existing profile for ${firebaseUser.uid}. Creating new 'parent' user.`);
    const newUser: AppUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!.toLowerCase(),
        name: firebaseUser.displayName,
        role: 'parent', 
        avatarId: 'avatar-1'
    };
    
    await setDoc(userDocRef, newUser);
    console.log(`[AUTH] checkUserProfile: New user profile created and saved to Firestore.`);
    return newUser;
}


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseAuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const setupProfileListener = useCallback((fbUser: FirebaseAuthUser) => {
    console.log(`[AUTH] setupProfileListener: Setting up Firestore listener for UID: ${fbUser.uid}`);
    const userDocRef = doc(db, 'users', fbUser.uid);
    
    const unsub = onSnapshot(userDocRef, (userDoc) => {
        console.log(`[AUTH] onSnapshot: Profile data received for ${fbUser.uid}. Exists: ${userDoc.exists()}`);
        if (userDoc.exists()) {
            const userData = userDoc.data() as AppUser;
            if (userData.role === 'admin') {
                console.log(`[AUTH] onSnapshot: Translating legacy 'admin' role to 'parent' for UID ${fbUser.uid}.`);
                userData.role = 'parent';
            }
            setUser(userData);
            console.log('[AUTH] onSnapshot: AppUser state updated with profile data:', userData);
        } else {
            console.warn(`[AUTH] onSnapshot: User document for ${fbUser.uid} does not exist. This can happen briefly during user creation.`);
            // checkUserProfile will handle creation if needed, but onAuthStateChanged is the primary trigger for that.
            // Setting user to null forces a re-check or logout state.
            setUser(null);
        }
    }, (error) => {
        console.error("[AUTH] onSnapshot: Error in profile listener:", error);
        toast({
            variant: 'destructive',
            title: 'Connection Error',
            description: `Could not sync your profile. You may be logged out. (${error.code})`,
        });
        setUser(null);
    });

    return unsub;

  }, [toast]);

  useEffect(() => {
    console.log('[AUTH] AuthProvider mounted. Setting up onAuthStateChanged listener.');
    let unsubscribeFromProfile: Unsubscribe | undefined;

    const unsubscribeFromAuth = onAuthStateChanged(auth, async (fbUser) => {
        console.log(`[AUTH] onAuthStateChanged: Fired. Firebase user: ${fbUser ? fbUser.uid : 'null'}`);
        
        // Clean up previous listener if it exists
        if (unsubscribeFromProfile) {
            console.log('[AUTH] onAuthStateChanged: Cleaning up old profile listener.');
            unsubscribeFromProfile();
            unsubscribeFromProfile = undefined;
        }

        if (fbUser) {
            if (fbUser.uid !== firebaseUser?.uid) {
                setLoading(true);
                setFirebaseUser(fbUser);
                try {
                    console.log('[AUTH] onAuthStateChanged: User is logged in. Setting session cookie.');
                    const idToken = await fbUser.getIdToken();
                    await fetch('/api/auth/session', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ idToken }),
                    });
                    console.log('[AUTH] onAuthStateChanged: Session cookie set. Checking profile and setting up listener.');

                    // Check profile first to ensure it exists, especially for first-time sign-ins.
                    const userProfile = await checkUserProfile(fbUser);
                    setUser(userProfile); // Set user immediately

                    // Now set up the real-time listener for future updates
                    unsubscribeFromProfile = setupProfileListener(fbUser);
                    setLoading(false);
                } catch (error: any) {
                    console.error('[AUTH] onAuthStateChanged: Error during user setup:', error);
                    toast({
                        variant: 'destructive',
                        title: 'Authentication Error',
                        description: error.message || 'An unknown error occurred during authentication.',
                    });
                    setUser(null);
                    setLoading(false);
                }
            } else {
                 setLoading(false);
            }
        } else {
            console.log('[AUTH] onAuthStateChanged: User is logged out. Deleting session cookie and clearing user state.');
            setLoading(true);
            if (user) { // only clear session if there was a user
                await fetch('/api/auth/session', { method: 'DELETE' });
            }
            setUser(null);
            setFirebaseUser(null);
            setLoading(false);
        }
    });

    return () => {
        console.log('[AUTH] AuthProvider unmounting. Cleaning up auth and profile listeners.');
        unsubscribeFromAuth();
        if (unsubscribeFromProfile) {
            unsubscribeFromProfile();
        }
    }
  }, [setupProfileListener, toast, user, firebaseUser]);

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
    // The onAuthStateChanged listener will handle clearing local state and session cookie.
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

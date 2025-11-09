'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  loginWithGoogle: () => Promise<User | null>;
  resetPassword: (email: string) => Promise<void>;
  sendMagicLink: (email: string) => Promise<void>;
  completeMagicLinkSignIn: (email: string, link: string) => Promise<User | null>;
  checkIsMagicLink: (link: string) => boolean;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  updateUserRole: (role: UserRole) => Promise<void>;
  isPrescrber: boolean;
  isPatient: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper function to get user data from Firestore
  const getUserData = async (firebaseUser: FirebaseUser): Promise<User | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          role: userData.role || 'patient',
          specialty: userData.specialty,
          registrationNumber: userData.registrationNumber,
          clinicName: userData.clinicName,
          prescriberId: userData.prescriberId,
          age: userData.age,
          height: userData.height,
          weight: userData.weight,
          gender: userData.gender,
          goals: userData.goals,
          createdAt: userData.createdAt?.toDate(),
          updatedAt: userData.updatedAt?.toDate(),
        };
      }
      
      // If no document exists, return basic user info with patient role
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        role: 'patient',
      };
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  // Helper function to create/update user document in Firestore
  const createUserDocument = async (
    firebaseUser: FirebaseUser,
    role: UserRole,
    additionalData?: Partial<User>
  ) => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // Create new user document
        await setDoc(userRef, {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          role,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          ...additionalData,
        });
      } else {
        // Update existing user document
        await setDoc(
          userRef,
          {
            role,
            updatedAt: serverTimestamp(),
            ...additionalData,
          },
          { merge: true }
        );
      }
    } catch (error) {
      console.error('Error creating/updating user document:', error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        const userData = await getUserData(firebaseUser);
        setUser(userData);
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const register = async (email: string, password: string, name: string, role: UserRole) => {
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Update display name
      await updateProfile(firebaseUser, { displayName: name });

      // Create user document in Firestore
      await createUserDocument(firebaseUser, role);

      // Refresh user data
      const userData = await getUserData(firebaseUser);
      setUser(userData);
    } catch (error) {
      console.error('Error during registration:', error);
      throw new Error(error instanceof Error ? error.message : 'Erro ao criar conta');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { user: firebaseUser } = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Get user data from Firestore
      const userData = await getUserData(firebaseUser);
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Error during login:', error);
      throw new Error(error instanceof Error ? error.message : 'Erro ao fazer login');
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const { user: firebaseUser } = await signInWithPopup(auth, provider);

      // Check if user already exists
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        // New user - create document with default role
        await createUserDocument(firebaseUser, 'patient');
      }

      // Get user data
      const userData = await getUserData(firebaseUser);
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Error during Google login:', error);
      throw new Error(error instanceof Error ? error.message : 'Erro ao fazer login com Google');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error(error instanceof Error ? error.message : 'Erro ao enviar email de recuperação');
    }
  };

  const buildActionCodeSettings = () => {
    const redirectUrl = process.env.NEXT_PUBLIC_EMAIL_LINK_REDIRECT_URL;

    if (redirectUrl) {
      return {
        url: redirectUrl,
        handleCodeInApp: true,
      };
    }

    if (typeof window === 'undefined') {
      throw new Error('Action code settings requerem contexto do navegador.');
    }

    return {
      url: `${window.location.origin}/login`,
      handleCodeInApp: true,
    };
  };

  const sendMagicLink = async (email: string) => {
    try {
      const actionCodeSettings = buildActionCodeSettings();
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    } catch (error) {
      console.error('Error sending magic link:', error);
      throw new Error(error instanceof Error ? error.message : 'Erro ao enviar o link de acesso');
    }
  };

  const completeMagicLinkSignIn = async (email: string, link: string) => {
    try {
      const result = await signInWithEmailLink(auth, email, link);
      const userData = await getUserData(result.user);
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Error completing magic link sign-in:', error);
      throw new Error(error instanceof Error ? error.message : 'Não foi possível concluir o acesso com o link');
    }
  };

  const checkIsMagicLink = (link: string) => {
    try {
      return isSignInWithEmailLink(auth, link);
    } catch (error) {
      console.error('Error checking magic link:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setFirebaseUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
      throw new Error(error instanceof Error ? error.message : 'Erro ao fazer logout');
    }
  };

  const updateUserRole = async (role: UserRole) => {
    if (!firebaseUser) {
      throw new Error('No user logged in');
    }

    try {
      await createUserDocument(firebaseUser, role);
      
      // Refresh user data
      const userData = await getUserData(firebaseUser);
      setUser(userData);
    } catch (error) {
      console.error('Error updating user role:', error);
      throw new Error(error instanceof Error ? error.message : 'Erro ao atualizar tipo de usuário');
    }
  };

  const value = {
    user,
    firebaseUser,
    loading,
    login,
    loginWithGoogle,
    register,
    resetPassword,
    sendMagicLink,
    completeMagicLinkSignIn,
    checkIsMagicLink,
    logout,
    updateUserRole,
    isPrescrber: user?.role === 'prescriber',
    isPatient: user?.role === 'patient',
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


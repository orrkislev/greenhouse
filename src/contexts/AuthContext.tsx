'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useAuthStore } from '@/store';
import { AuthService } from '@/services/auth';
import { AuthState } from '@/types';

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, loading, error, setUser, setLoading, setError, logout } = useAuthStore();

  useEffect(() => {
    setLoading(true);
    
    const unsubscribe = AuthService.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const user = await AuthService.signIn(email, password);
      setUser(user);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to sign in');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      setLoading(true);
      setError(null);
      const user = await AuthService.signUp(email, password, displayName);
      setUser(user);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to sign up');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      await AuthService.signOut();
      logout();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to sign out');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '@/store';
import { AuthService } from '@/services/auth';

const AuthContext = React.createContext(null);

export function AuthProvider({ children }) {
  const { user, loading, error, setUser, setLoading, setError, logout } = useAuthStore();

  useEffect(() => {
    // setLoading(true);
    const unsubscribe = AuthService.onAuthStateChange((user) => {
      console.log('Auth state changed:', user);
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [setUser, setLoading]);

  const signIn = async (email, password) => {
    console.log('Signing in with:', { email, password });
    try {
      setLoading(true);
      setError(null);
      const user = await AuthService.signIn(email, password);
      setUser(user);
      console.log('Sign in successful:', user);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to sign in');
      console.error('Sign in error:', error);
      throw error;
    } finally {
      console.log('Sign in process completed');
      setLoading(false);
    }
  };

  const signUp = async (email, password, displayName) => {
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

  const value = { user, loading, error, signIn, signUp, signOut };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

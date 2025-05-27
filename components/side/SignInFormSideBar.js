// components/side/SignInFormSideBar.js
'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, LogOut } from 'lucide-react';
import { useUser } from '../../utils/store/user';

export default function SignInFormSideBar() {
  const [showPassword, setShowPassword] = useState(false);
  const { user, signIn, signOut, loading, error } = useUser();

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      await signIn(data.email, data.password);
    } catch (error) {
      // Error is handled by the auth context
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      // Handle sign out error if necessary
      console.error("Sign out error:", error);
    }
  };

  if (user) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-lg font-medium">Hey, {user.displayName || user.email}!</p>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md disabled:opacity-50"
          disabled={loading}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {loading ? 'Signing out...' : 'Sign out'}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}
      
      <div className="space-y-2">
        <label htmlFor="email-sidebar" className="text-sm font-medium">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            id="email-sidebar"
            type="email"
            placeholder="Enter your email"
            className="pl-10 w-full border rounded-md p-2 text-sm"
            {...register('email')}
          />
        </div>
        {errors.email && (
          <p className="text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="password-sidebar" className="text-sm font-medium">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            id="password-sidebar"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            className="pl-10 pr-10 w-full border rounded-md p-2 text-sm"
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  );
}

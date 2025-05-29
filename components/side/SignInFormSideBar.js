'use client';

import { useState } from 'react';
import { UserCircle2 } from 'lucide-react';
import { useUser } from '@/utils/store/user';
import PINInput from '../ui/PIN';

export default function SignInFormSideBar() {
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState(['', '', '', '']);
  const { signIn, loading, error } = useUser();

  const onSubmit = (e) => {
    e.preventDefault();
    signIn(email, pin);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <label htmlFor="email-sidebar" className="text-sm font-medium">
          Username
        </label>
        <div className="relative">
          <UserCircle2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            id="email-sidebar"
            placeholder="username"
            className="pl-10 w-full border rounded-md p-2 text-sm"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="username"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="password-sidebar" className="text-sm font-medium">
          PIN
        </label>
        <div className="flex gap-2">
          <PINInput onChange={setPin} />
        </div>
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

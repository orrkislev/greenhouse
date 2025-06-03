'use client';

import { useState } from 'react';
import { UserCircle2 } from 'lucide-react';
import { useUser } from '@/utils/store/user';
import PINInput from '../ui/PIN';
import { redirect } from 'next/navigation';

export default function WithAuth({ children, role }) {
    const [username, setUsername] = useState('');
    const [pin, setPin] = useState(['', '', '', '']);
    const { user, signIn, loading, error } = useUser();

    if (Object.keys(user).length > 0) {
        if (!role || (role && user.roles && user.roles.includes(role))) {
            return children;
        } else {
            console.warn('Unauthorized access attempt:', user);
            redirect('/')
        }
    }

    const onSubmit = (e) => {
        e.preventDefault();
        signIn(username, pin);
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Sign In</h1>
                <p className="text-sm text-gray-600">Please enter your username and PIN to continue.</p>
            </div>
            <div className="mb-6">
                <form onSubmit={onSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                            {error}
                        </div>
                    )}
                    <div className="space-y-2">
                        <label htmlFor="username-sidebar" className="text-sm font-medium">
                            Username
                        </label>
                        <div className="relative">
                            <UserCircle2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <input
                                id="username-sidebar"
                                placeholder="username"
                                className="pl-10 w-full border rounded-md p-2 text-sm"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
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
            </div>
        </div>
    );
}

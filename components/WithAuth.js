'use client';

import { useState } from 'react';
import { UserCircle2 } from 'lucide-react';
import { useUser } from '@/utils/store/useUser';
import PINInput from './ui/PIN';
import { redirect } from 'next/navigation';

export default function WithAuth({ children, role }) {
    const [username, setUsername] = useState('');
    const [pin, setPin] = useState(['', '', '', '']);
    const { user, signIn, loading, error } = useUser();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg text-gray-600">טוען...</div>
            </div>
        );
    }


    if (user && Object.keys(user).length > 0) {
        if (!role || (role && user.roles && user.roles.includes(role))) {
            return children;
        } else {
            redirect('/')
        }
    }

    const onSubmit = (e) => {
        e.preventDefault();
        signIn(username, pin);
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Sign In Form */}
            <div className="flex-1 bg-white flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Logo/Icon Section */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <UserCircle2 className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">הי!</h1>
                        <p className="text-sm text-gray-600">
                            היכנסו עם שם המשתמש והסיסמא שלהם
                            אם אתם לא זוכרים, פנו למנטורים
                        </p>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label htmlFor="username-sidebar" className="text-sm font-medium text-gray-700">
                                שם משתמש
                            </label>
                            <input
                                id="username-sidebar"
                                type="text"
                                placeholder="שם משתמש"
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                autoComplete="username"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password-sidebar" className="text-sm font-medium text-gray-700">
                                סיסמא (4 ספרות)
                            </label>
                            <div className="flex gap-2 justify-center">
                                <PINInput onChange={e => setPin(e.target.value)} />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 transition-all duration-200"
                            disabled={loading}
                        >
                            {loading ? 'ממתין...' : 'התחבר'}
                        </button>
                    </form>
                    
                </div>
            </div>

            {/* Right Side - Beautiful Gradient Graphics */}
            <div className="flex-1 bg-gradient-to-br from-purple-200 via-pink-100 to-orange-200 relative overflow-hidden">
                {/* Abstract geometric shapes for visual interest */}
                <div className="absolute inset-0">
                    {/* Large gradient circle */}
                    <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-purple-300/30 to-pink-300/30 rounded-full blur-3xl"></div>

                    {/* Medium gradient circle */}
                    <div className="absolute bottom-32 left-16 w-48 h-48 bg-gradient-to-br from-orange-300/40 to-pink-300/40 rounded-full blur-2xl"></div>

                    {/* Small accent circles */}
                    <div className="absolute top-1/3 left-1/3 w-32 h-32 bg-gradient-to-br from-blue-300/20 to-purple-300/20 rounded-full blur-xl"></div>

                    {/* Subtle line elements */}
                    <div className="absolute top-1/2 right-1/4 w-1 h-32 bg-gradient-to-b from-transparent via-white/20 to-transparent transform rotate-12"></div>
                    <div className="absolute bottom-1/3 left-1/2 w-1 h-24 bg-gradient-to-b from-transparent via-white/15 to-transparent transform -rotate-12"></div>
                </div>
            </div>
        </div>
    );
}

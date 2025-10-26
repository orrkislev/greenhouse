'use client';

import { useState } from 'react';
import { isAdmin, isStaff, userActions, useUser } from '@/utils/store/useUser';
import PINInput from './ui/PIN';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import WithLabel from './WithLabel';
import { Icon } from '@iconify/react';

export default function WithAuth({ children, role }) {
    const [username, setUsername] = useState('');
    const [pin, setPin] = useState(['', '', '', '']);
    const { user, loading, error } = useUser();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg text-stone-600">טוען...</div>
            </div>
        );
    }


    if (user && Object.keys(user).length > 0) {
        if (!role) return children;
        else if (role == 'staff' && isStaff()) return children;
        else if (role == 'admin' && isAdmin()) return children;
        else redirect('/')
    }

    const onSubmit = (e) => {
        e.preventDefault();
        userActions.signIn(username, pin);
    };

    return (
        <div className="min-h-screen flex">
            <div className="flex-2 bg-white flex items-center justify-center">
                <div className="w-[50vw] -mt-8">
                    <div className="flex flex-col items-center justify-center mb-4">
                        <Image src="/logo.png" alt="logo" width={300} height={300} priority={true} style={{ width: '300px' }} />
                    </div>

                    <div className='flex gap-4'>
                        <form onSubmit={onSubmit} className="flex-1 flex flex-col justify-center px-4 gap-8">
                            {error && (
                                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                                    {error.message}
                                </div>
                            )}

                            <p className="text-sm text-stone-600 text-center">
                                היכנסו עם שם המשתמש והסיסמא הקצרה <br />
                                אם אתם לא זוכרים, פנו למנטורים
                            </p>

                            <WithLabel label="שם משתמש">
                                <input
                                    id="username-sidebar"
                                    type="text"
                                    placeholder="שם משתמש"
                                    className="w-full border border-stone-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    autoComplete="username"
                                />
                            </WithLabel>

                            <WithLabel label="סיסמא (4 ספרות)">
                                <div className="flex justify-center">
                                    <PINInput onChange={e => setPin(e.target.value)} hideInput={true} withLabel={false} />
                                </div>
                            </WithLabel>
                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 transition-all duration-200"
                                disabled={loading}
                            >
                                {loading ? 'ממתין...' : 'התחבר'}
                            </button>
                        </form>

                        <div className='flex-1 flex flex-col items-center justify-center gap-4'>
                            <div className='flex-1 w-[1px] bg-stone-200'></div>
                            <p className='text-sm text-stone-500 text-center'>או</p>
                            <div className='flex-1 w-[1px] bg-stone-200'></div>
                        </div>

                        <div className='flex-1 flex flex-col items-center justify-center gap-4'>
                            <p className='text-sm text-stone-500 text-center'>התחברות עם חשבון חממה</p>
                            <Icon icon="devicon:google" className="w-12 h-12 p-2 grayscale-20 hover:grayscale-0 hover:saturate-300 hover:bg-stone-100 rounded-full cursor-pointer transition-all duration-200"
                                onClick={() => userActions.signInWithGoogle()}
                            />
                        </div>
                    </div>

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

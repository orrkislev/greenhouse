"use client"

import * as React from "react"
import { userActions, useUser } from "@/utils/useUser";
import { tw } from "@/utils/tw";
import { LogOut, User, BookOpen, Briefcase, Calendar, Settings, Snail, UsersRound, TreePalm, Skull, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const TopBarDiv = tw`w-full z-50 flex items-center justify-center`;
const NavigationMenu = tw`bg-white border-x border-b border-gray-200 rounded-b-lg flex gap-1 px-2 items-center`
const NavigationMenuItem = tw`flex gap-2 rtl justify-center items-center p-2`

const LinkClasses = `flex flex-col items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg p-2`
const Separator = tw`mx-2 h-6 w-px bg-gray-300`

export default function TopBar() {
    const user = useUser((state) => state.user);

    if (!user) return null;

    return (
        <TopBarDiv>
            <NavigationMenu>
                {/* Home */}
                <NavigationMenuItem>
                    <Link href="/" className={LinkClasses}>
                        <TreePalm className="w-4 h-4" />
                        <div>מרכז הבקרה</div>
                    </Link>
                </NavigationMenuItem>

                {/* Schedule */}
                <NavigationMenuItem>
                    <Link href="/schedule" className={LinkClasses}>
                        <Calendar className="w-4 h-4" />
                        <div>לוח זמנים</div>
                    </Link>
                </NavigationMenuItem>

                <Separator />

                {/* Learning */}
                <NavigationMenuItem>
                    <Link href="/learn" className={LinkClasses}>
                        <BookOpen className="w-4 h-4" />
                        <div>למידה</div>
                    </Link>
                </NavigationMenuItem>

                {/* Projects */}
                <NavigationMenuItem>
                    <Link href="/project" className={LinkClasses}>
                        <Snail className="w-4 h-4" />
                        <div>הפרויקט</div>
                    </Link>
                </NavigationMenuItem>

                {/* Vocation */}
                <NavigationMenuItem>
                    <Link href="/vocation" className={LinkClasses}>
                        <Briefcase className="w-4 h-4" />
                        <div>תעסוקה</div>
                    </Link>
                </NavigationMenuItem>

                <Separator />

                {/* Staff only */}
                {user && user.roles && user.roles.includes('staff') && (
                    <NavigationMenuItem>
                        <Link href="/staff" className={LinkClasses}>
                            <UsersRound className="w-4 h-4" />
                            <div>החניכים שלי</div>
                        </Link>
                    </NavigationMenuItem>
                )}

                {user && user.roles && user.roles.includes('admin') && (
                    <NavigationMenuItem>
                        <Link href="/admin" className={LinkClasses}>
                            <Skull className="w-4 h-4" />
                            <div>ניהול</div>
                        </Link>
                    </NavigationMenuItem>
                )}

                {user && user.roles && user.roles.includes('staff') && (
                    <Separator />
                )}

                {/* Settings */}
                <NavigationMenuItem>
                    <Link href="/settings" className={LinkClasses}>
                        <Settings className="w-4 h-4" />
                        <div>הגדרות</div>
                    </Link>
                </NavigationMenuItem>

                {/* User Menu */}
                <NavigationMenuItem>
                    <UserMenu user={user} />
                </NavigationMenuItem>

            </NavigationMenu>
        </TopBarDiv>
    );
}

function UserMenu({ user }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="flex items-center justify-center gap-1 relative">
            <div onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-100 rounded-lg p-2">
                <User className="w-4 h-4 text-gray-500" />
                <div className="text-sm text-gray-500">{user ? user.firstName : "Guest"} </div>
                <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>

            {isOpen && (
                <div className="absolute top-10 right-0 w-48 bg-white rounded-lg shadow-md z-50 flex flex-col gap-2 p-2">
                    <div className="text-sm text-gray-500">{user ? user.firstName + ' ' + user.lastName : "Guest"}</div>
                    <div onClick={userActions.logout} className='cursor-pointer flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg p-2'>
                        <LogOut className="w-4 h-4" /> יציאה
                    </div>
                </div>
            )}
        </div>
    )
}
"use client"

import * as React from "react"
import { userActions, useUser } from "@/utils/store/useUser";
import { tw } from "@/utils/tw";
import { LogOut, User, BookOpen, Briefcase, Calendar, Settings, Snail, UsersRound, TreePalm, Skull, ChevronDown, Brain } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

const SideBarDiv = tw`flex flex-col border-l border-gray-600 bg-gray-100`
const SideBarHeader = tw`aspect-square flex items-center justify-center p-2 relative`
const SideBarContent = tw`h-full flex flex-col gap-1 pt-8 flex-1`
const SideBarFooter = tw`flex flex-col gap-1 p-2`

const NavigationMenuItem = tw`flex gap-2 rtl items-center p-2 text-gray-500 hover:text-gray-700 mr-4
    ${props => props.$active ? 'bg-white text-blue-700 rounded-r-full -ml-px border-y border-r border-gray-600' : ''}
    ${props => props.$disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
    `

const LinkClasses = `flex justify-center gap-1 text-sm hover:bg-white rounded-lg p-2`
const Separator = tw`h-px w-8 bg-gray-300 mx-auto`

export default function SideBar() {
    const pathname = usePathname();
    const user = useUser((state) => state.user);

    if (!user) return null;

    return (
        <SideBarDiv>
            <SideBarHeader>
                <Image src="/logo.png" alt="logo" fill={true} style={{ objectFit: 'contain' }} priority={true} 
                    sizes="(max-width: 768px) 20vw, (max-width: 1200px) 20vw, 20vw" />
            </SideBarHeader>
            <SideBarContent>
                {/* Home */}
                <NavigationMenuItem $active={pathname === '/'}>
                    <Link href="/" className={LinkClasses}>
                        <TreePalm className="w-4 h-4" />
                        <div>בית</div>
                    </Link>
                </NavigationMenuItem>

                {/* Schedule */}
                <NavigationMenuItem $active={pathname === '/schedule'}>
                    <Link href="/schedule" className={LinkClasses}>
                        <Calendar className="w-4 h-4" />
                        <div>לוח זמנים</div>
                    </Link>
                </NavigationMenuItem>

                <Separator />

                {/* Learning */}
                <NavigationMenuItem $active={pathname === '/learn'}>
                    <Link href="/learn" className={LinkClasses}>
                        <BookOpen className="w-4 h-4" />
                        <div>למידה</div>
                    </Link>
                </NavigationMenuItem>

                {/* Projects */}
                <NavigationMenuItem $active={pathname === '/project'}>
                    <Link href="/project" className={LinkClasses}>
                        <Snail className="w-4 h-4" />
                        <div>הפרויקט</div>
                    </Link>
                </NavigationMenuItem>

                {/* Research */}
                <NavigationMenuItem $active={pathname === '/research'}>
                    <Link href="/research" className={LinkClasses}>
                        <Brain className="w-4 h-4" />
                        <div>חקר</div>
                    </Link>
                </NavigationMenuItem>

                {/* Vocation */}
                <NavigationMenuItem $active={pathname === '/vocation'} $disabled={true}>
                    <Link href="/vocation" className={LinkClasses}>
                        <Briefcase className="w-4 h-4" />
                        <div>תעסוקה</div>
                    </Link>
                </NavigationMenuItem>

                <Separator />

                {/* Staff only */}
                {user && user.roles && user.roles.includes('staff') && (
                    <NavigationMenuItem $active={pathname === '/staff'}>
                        <Link href="/staff" className={LinkClasses}>
                            <UsersRound className="w-4 h-4" />
                            <div>החניכים שלי</div>
                        </Link>
                    </NavigationMenuItem>
                )}

                {user && user.roles && user.roles.includes('admin') && (
                    <NavigationMenuItem $active={pathname === '/admin'}>
                        <Link href="/admin" className={LinkClasses}>
                            <Skull className="w-4 h-4" />
                            <div>ניהול</div>
                        </Link>
                    </NavigationMenuItem>
                )}


            </SideBarContent>

            {/* User Menu */}
            <SideBarFooter>
                <NavigationMenuItem $active={pathname === '/admin'}>
                    <div className={LinkClasses} onClick={() => userActions.logout()}>
                        <User className="w-4 h-4" />
                        <div>{user.firstName}</div>
                    </div>
                </NavigationMenuItem>
            </SideBarFooter>

        </SideBarDiv>
    );
}
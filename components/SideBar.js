"use client"

import { userActions, useUser } from "@/utils/store/useUser";
import { tw } from "@/utils/tw";
import { BookOpen, Briefcase, Calendar, Snail, UsersRound, TreePalm, Skull, Brain, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import Avatar from "./Avatar";

const SideBarDiv = tw`flex flex-col border-l border-stone-400 bg-stone-200 -my-6 py-4`
const SideBarContent = tw`h-full flex flex-col gap-1 pt-8 flex-1 z-0`
const SideBarFooter = tw`flex flex-col gap-1 pb-4`

const NavigationMenuItem = tw`flex gap-2 rtl items-center p-1 pl-2 text-stone-500 hover:text-stone-700 mr-4 relative overflow-hidden -ml-px
${props => props.$disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
`
const LinkClasses = `flex justify-center gap-1 text-sm rounded-lg p-2 z-2 items-center`
const Separator = tw`h-px w-8 bg-stone-300 mx-auto`



export default function SideBar() {
    const pathname = usePathname();
    const user = useUser((state) => state.user)
    if (!user) return null;


    return (
        <SideBarDiv>
            <Link href="/" className="aspect-square flex items-center justify-center p-2 relative">
                <Image src="/logo.png" alt="logo" fill={true} style={{ objectFit: 'contain' }} priority={true}
                    sizes="(max-width: 768px) 20vw, (max-width: 1200px) 20vw, 20vw" />
            </Link>
            <Separator className='w-full' />
            <div className="flex gap-2 items-center p-2 justify-center text-sm">
                <Avatar user={user} />
                <div>{user.firstName}</div>
            </div>
            <Separator className='w-full' />
            <SideBarContent>
                {/* Home */}
                <SideBarItem href="/" icon={<TreePalm className="w-4 h-4" />} label="בית" active={pathname === '/'} />

                {/* Schedule */}
                <SideBarItem href="/schedule" icon={<Calendar className="w-4 h-4" />} label="לוח זמנים" active={pathname === '/schedule'} />

                <Separator />

                {/* Learning */}
                <SideBarItem href="/learn" icon={<BookOpen className="w-4 h-4" />} label="למידה" active={pathname === '/learn'} />

                {/* Projects */}
                <SideBarItem href="/project" icon={<Snail className="w-4 h-4" />} label="הפרויקט" active={pathname === '/project'} />

                {/* Research */}
                <SideBarItem href="/research" icon={<Brain className="w-4 h-4" />} label="חקר" active={pathname === '/research'} />

                {/* Vocation */}
                <SideBarItem href="/vocation" icon={<Briefcase className="w-4 h-4" />} label="תעסוקה" active={pathname === '/vocation'} disabled={true} />

                <Separator />

                {/* Staff only */}
                {user && user.roles && user.roles.includes('staff') && (
                    <SideBarItem href="/staff" icon={<UsersRound className="w-4 h-4" />} label="החניכים שלי" active={pathname === '/staff'} />
                )}

                {user && user.roles && user.roles.includes('admin') && (
                    <SideBarItem href="/admin" icon={<Skull className="w-4 h-4" />} label="ניהול" active={pathname === '/admin'} />
                )}
            </SideBarContent>

            {/* User Menu */}
            <SideBarFooter>
                <NavigationMenuItem>
                    <div className={LinkClasses + ' cursor-pointer hover:bg-white'} onClick={() => userActions.logout()}>
                        <LogOut className="w-4 h-4" />
                        <div>יציאה</div>
                    </div>
                </NavigationMenuItem>
            </SideBarFooter>

        </SideBarDiv >
    );
}

function SideBarItem({ href, icon, label, active, disabled }) {

    return (
        <NavigationMenuItem $active={active} $disabled={disabled}>
            <AnimatePresence>
                {active && (
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0, transition: { duration: .2, ease: 'circInOut' } }}
                        exit={{ x: '-100%', transition: { duration: .2, ease: 'circInOut' } }}
                        className="w-full h-full rounded-r-full absolute left-0 z-1 -translate-x-px border-r border-y border-stone-400 bg-stone-50"
                    />
                )}
            </AnimatePresence>
            <Link href={href} className={LinkClasses + ' ' + (active ? 'text-black' : 'hover:bg-white')} >
                {icon}
                <div className="text-sm">{label}</div>
            </Link>
        </NavigationMenuItem>
    )
}
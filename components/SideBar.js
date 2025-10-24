"use client"

import { isAdmin, isStaff, userActions, useUser } from "@/utils/store/useUser";
import { tw } from "@/utils/tw";
import { BookOpen, Briefcase, Calendar, Snail, UsersRound, TreePalm, Skull, Brain, LogOut, ChevronsLeft } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import Avatar from "./Avatar";
import { useStudyPaths } from "@/utils/store/useStudy";

const SideBarDiv = tw`flex flex-col border-l border-stone-400 bg-stone-200 -my-6 py-4`
const SideBarContent = tw`h-full flex flex-col gap-1 pt-8 flex-1 z-0`
const SideBarFooter = tw`flex flex-col gap-1 pb-4`

const NavigationMenuItem = tw`flex gap-2 rtl items-center p-1 pl-2 text-stone-500 hover:text-stone-700 mr-4 relative overflow-hidden -ml-px
${props => props.$disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
${props => props.$small ? 'text-xs py-1 -mt-1' : 'text-sm'}
`
const LinkClasses = `flex justify-center gap-1 rounded-lg z-2 items-center`
const Separator = tw`h-px w-8 bg-stone-300 mx-auto ${props => props.$small ? 'my-1' : ''}`
const IconClasses = `w-4 h-4`


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

            <SideBarItem href="/profile" active={pathname === '/profile'}>
                <Avatar user={user} hoverScale={false} />
                <div>{user.first_name}</div>
            </SideBarItem>

            <Separator className='w-full' />
            <SideBarContent>
                {/* Home */}
                <SideBarItem href="/" Icon={TreePalm} label="בית" active={pathname === '/'} />

                {/* Schedule */}
                <SideBarItem href="/schedule" Icon={Calendar} label="לוח זמנים" active={pathname === '/schedule'} />

                <Separator />

                <SideBarItem href="/study" Icon={BookOpen} label="למידה" active={pathname === '/study'} />

                {pathname === '/study' && <SideBarStudyItems />}

                <SideBarItem href="/project" Icon={Snail} label="הפרויקט" active={pathname === '/project'} />
                <SideBarItem href="/research" Icon={Brain} label="חקר" active={pathname === '/research'} />
                <SideBarItem href="/vocation" Icon={Briefcase} label="תעסוקה" active={pathname === '/vocation'} />

                <Separator />

                {/* Staff only */}
                {user && isStaff() && (
                    <SideBarItem href="/staff" Icon={UsersRound} label="החניכים שלי" active={pathname === '/staff'} />
                )}

                {user && isAdmin() && (
                    <SideBarItem href="/admin" Icon={Skull} label="ניהול" active={pathname === '/admin'} />
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

function SideBarItem({ href, Icon, label, active, disabled, small = false, children }) {
    return (
        <NavigationMenuItem $active={active} $disabled={disabled} $small={small}>
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
            <Link href={href} className={`${LinkClasses} ${active ? 'text-black' : 'hover:bg-white '} ${small ? 'p-1' : 'p-2'}`}>
                {children ? children : (
                    <>
                        {Icon && <Icon className={`${IconClasses} ${small ? 'w-3 h-3' : 'w-4 h-4'}`} />}
                        <div className={`text-sm ${small ? 'text-xs' : 'text-sm'}`}>{label}</div>
                    </>
                )}
            </Link>
        </NavigationMenuItem>
    )
}



function SideBarStudyItems() {
    const searchParams = useSearchParams();
    const study = useStudyPaths()

    const urlId = searchParams.get('id')

    return (
        <>
            {study.map(path => (
                <SideBarItem key={path.id}
                    href={`/study?id=${path.id}`}
                    Icon={ChevronsLeft}
                    label={path.title.length > 10 ? path.title.slice(0, 10) + '...' : path.title}
                    active={urlId === path.id}
                    small={true}
                />
            ))}
            <Separator />
        </>
    )
}
"use client"

import { isAdmin, isStaff, userActions, useUser } from "@/utils/store/useUser";
import { tw } from "@/utils/tw";
import { BookOpen, Briefcase, Calendar, Snail, UsersRound, TreePalm, Skull, Brain, LogOut, ChevronsLeft, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import Avatar from "./Avatar";
import { useStudyPaths } from "@/utils/store/useStudy";
import { useState } from "react";

const SideBarDiv = tw`flex flex-col border-l border-stone-400 bg-stone-200 -my-6 py-4
md:flex md:flex-col
hidden
`

// Mobile top bar
const TopBarDiv = tw`flex md:hidden items-center justify-between border-b border-stone-400 bg-stone-200 px-2 py-2 z-50`
const TopBarContent = tw`flex items-center gap-1 overflow-x-auto flex-1 justify-center`

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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    if (!user) return null;

    return (
        <>
            {/* Mobile Top Bar */}
            <TopBarDiv>
                <Link href="/" className="w-12 h-12 flex items-center justify-center relative flex-shrink-0 hidden md:block">
                    <Image src="/logo.png" alt="logo" fill={true} style={{ objectFit: 'contain' }} priority={true} sizes="48px" />
                </Link>

                <TopBarContent>
                    <TopBarIconItem href="/" Icon={TreePalm} active={pathname === '/'} title="בית" />
                    <TopBarIconItem href="/schedule" Icon={Calendar} active={pathname === '/schedule'} title="לוח זמנים" />
                    <TopBarIconItem href="/study" Icon={BookOpen} active={pathname === '/study'} title="למידה" />
                    <TopBarIconItem href="/project" Icon={Snail} active={pathname === '/project'} title="הפרויקט" />
                    <TopBarIconItem href="/research" Icon={Brain} active={pathname === '/research'} title="חקר" />
                    <TopBarIconItem href="/vocation" Icon={Briefcase} active={pathname === '/vocation'} title="תעסוקה" />
                    {isStaff() && <TopBarIconItem href="/staff" Icon={UsersRound} active={pathname === '/staff'} title="החניכים שלי" />}
                    {isAdmin() && <TopBarIconItem href="/admin" Icon={Skull} active={pathname === '/admin'} title="ניהול" />}
                </TopBarContent>

                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 hover:bg-stone-300 rounded-lg">
                    {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </TopBarDiv>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed inset-0 bg-black/50 z-40 mt-12" onClick={() => setMobileMenuOpen(false)}>
                    <div className="bg-stone-100 w-64 h-full p-4 flex flex-col gap-2" onClick={e => e.stopPropagation()}>
                        <Link href="/profile" className="flex items-center gap-2 p-2 hover:bg-stone-200 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                            <Avatar user={user} hoverScale={false} />
                            <div>{user.first_name}</div>
                        </Link>
                        <div className="h-px bg-stone-300 my-2" />
                        <button onClick={() => { userActions.logout(); setMobileMenuOpen(false); }} className="flex items-center gap-2 p-2 hover:bg-stone-200 rounded-lg text-stone-600">
                            <LogOut className="w-4 h-4" />
                            <div>יציאה</div>
                        </button>
                    </div>
                </div>
            )}

            {/* Desktop Sidebar */}
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
        </>
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

function TopBarIconItem({ href, Icon, active, title }) {
    return (
        <Link
            href={href}
            className={`flex items-center justify-center p-2 rounded-lg transition-colors relative ${
                active ? 'bg-stone-50 text-stone-900' : 'text-stone-600 hover:bg-stone-300 hover:text-stone-900'
            }`}
            title={title}
        >
            {active && (
                <motion.div
                    layoutId="topbar-active"
                    className="absolute inset-0 bg-stone-50 rounded-lg border border-stone-400"
                    transition={{ duration: 0.2 }}
                />
            )}
            <Icon className="w-5 h-5 relative z-10" />
        </Link>
    )
}
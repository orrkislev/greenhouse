"use client"

import * as React from "react"
import Link from "next/link"
import { useUser } from "@/utils/store/user";
import { tw } from "@/utils/tw";
import { LogOut, User, BookOpen, Briefcase, Calendar, Settings } from "lucide-react";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu"
import { Button } from "./ui/button";

const TopBarDiv = tw`w-full z-50 flex items-center justify-center`;

export default function TopBar() {
    const user = useUser((state) => state.user);
    const logout = useUser((state) => state.logout);

    return (
        <TopBarDiv>
            <NavigationMenu viewport={false} className="bg-white p-2 shadow-md " style={{ borderRadius: "0 0 8px 8px" }}>
                <NavigationMenuList className="flex items-center gap-2 rtl">
                    {/* User Menu */}
                    <NavigationMenuItem>
                        <NavigationMenuTrigger>
                            <User className="w-5 h-5" />
                            {user ? user.firstName : "User"}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent className="z-50">
                            <div className="p-4 min-w-[220px] flex flex-col gap-2">
                                <div className="font-semibold text-lg">{user ? user.firstName + ' ' + user.lastName : "Guest"}</div>
                                <div className="text-sm text-muted-foreground">{user ? user.email : "No email"}</div>
                                <Button onClick={logout}>
                                    <LogOut className="w-4 h-4" /> יציאה
                                </Button>
                            </div>
                        </NavigationMenuContent>
                    </NavigationMenuItem>

                    {/* Learning */}
                    <NavigationMenuItem>
                        <NavigationMenuLink>
                            <Link href="/learning" className="flex items-center justify-center gap-1">
                                <BookOpen className="w-5 h-5" /> למידה
                            </Link>
                        </NavigationMenuLink>
                    </NavigationMenuItem>

                    {/* Projects */}
                    <NavigationMenuItem>
                        <NavigationMenuLink>
                            <Link href="/projects" className="flex items-center justify-center gap-1">
                                <Briefcase className="w-5 h-5" /> פרויקטים
                            </Link>
                        </NavigationMenuLink>
                    </NavigationMenuItem>

                    {/* Schedule */}
                    <NavigationMenuItem>
                        <NavigationMenuLink>
                            <Link href="/schedule" className="flex items-center justify-center gap-1">
                                <Calendar className="w-5 h-5" /> לוח זמנים
                            </Link>
                        </NavigationMenuLink>
                    </NavigationMenuItem>

                    {/* Separator */}
                    <div className="mx-2 h-6 w-px bg-gray-300" />

                    {/* Settings */}
                    <NavigationMenuItem>
                        <NavigationMenuLink>
                            <Link href="/settings" className="flex items-center justify-center gap-1">
                                <Settings className="w-5 h-5" /> הגדרות
                            </Link>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
        </TopBarDiv>
    );
}
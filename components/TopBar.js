"use client"

import * as React from "react"
import { useUser } from "@/utils/store/user";
import { tw } from "@/utils/tw";
import { LogOut, User, BookOpen, Briefcase, Calendar, Settings, Snail } from "lucide-react";
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
                        <NavigationMenuLink href="/learning" className="flex items-center justify-center gap-1">
                            <BookOpen className="w-5 h-5" /> למידה
                        </NavigationMenuLink>
                    </NavigationMenuItem>

                    {/* Projects */}
                    <NavigationMenuItem>
                        <NavigationMenuLink href="/project" className="flex items-center justify-center gap-1">
                            <Snail className="w-5 h-5" /> הפרויקט
                        </NavigationMenuLink>
                    </NavigationMenuItem>

                    {/* Schedule */}
                    <NavigationMenuItem>
                        <NavigationMenuLink href="/" className="flex items-center justify-center gap-1">
                            <Calendar className="w-5 h-5" /> לוח זמנים
                        </NavigationMenuLink>
                    </NavigationMenuItem>

                    {/* Separator */}
                    <div className="mx-2 h-6 w-px bg-gray-300" />

                    {/* Staff only */}
                    {user && user.roles && user.roles.includes('staff') && (
                        <NavigationMenuItem>
                            <NavigationMenuLink href="/staff" className="flex items-center justify-center gap-1">
                                <Briefcase className="w-5 h-5" /> צוות
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                    )}

                    {/* Separator */}
                    <div className="mx-2 h-6 w-px bg-gray-300" />

                    {/* Settings */}
                    <NavigationMenuItem>
                        <NavigationMenuLink href="/settings" className="flex items-center justify-center gap-1">
                            <Settings className="w-5 h-5" /> הגדרות
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
        </TopBarDiv>
    );
}
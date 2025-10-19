'use client'

import { AvatarEdit } from "@/components/Avatar";
import { PageMain } from "@/components/ContextBar";
import { ChangePasswordButton } from "../(main)/components/MainContext";
import Box2 from "@/components/Box2";
import { User } from "lucide-react";
import { useUser } from "@/utils/store/useUser";

export default function ProfilePage() {
    const user = useUser(state => state.user);
    console.log(user);
    return (
        <PageMain className="flex items-center justify-center">
            <Box2 label="פרופיל" LabelIcon={User} className="w-64">
                <div className="flex flex-col items-center justify-center gap-2 p-4">
                    <div className="text-lg font-bold text-stone-500">{user.first_name} {user.last_name}</div>
                    <div className="text-xs text-stone-500 -mt-4">{user.username}</div>
                    <AvatarEdit />
                    <ChangePasswordButton />
                </div>
            </Box2>
        </PageMain>
    )
}
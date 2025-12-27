'use client'

import { AvatarEdit } from "@/components/Avatar";
import { PageMain } from "@/components/ContextBar";
import { ChangePasswordButton } from "../(main)/components/MainContext";
import Box2 from "@/components/Box2";
import { User } from "lucide-react";
import { useUser, userActions } from "@/utils/store/useUser";

const PRONOUNS_OPTIONS = [
    { value: '', label: '-' },
    { value: 'he', label: 'הוא' },
    { value: 'she', label: 'היא' },
    { value: 'they', label: 'הם' },
];

export default function ProfilePage() {
    const user = useUser(state => state.user);

    const handlePronounsChange = (e) => {
        userActions.updateUserData({ profile: { ...user.profile, pronouns: e.target.value } });
    };

    return (
        <PageMain className="flex items-center justify-center">
            <Box2 label="פרופיל" LabelIcon={User} className="w-64">
                <div className="flex flex-col items-center justify-center gap-2 p-4">
                    <div className="text-lg font-bold text-muted-foreground">{user.first_name} {user.last_name}</div>
                    <div className="text-xs text-muted-foreground -mt-4">{user.username}</div>
                    <AvatarEdit />
                    <div className="flex items-center gap-2 mt-2">
                        <label className="text-sm text-muted-foreground">כינוי:</label>
                        <select
                            className="p-1 border rounded text-sm"
                            value={user.profile?.pronouns || ''}
                            onChange={handlePronounsChange}
                        >
                            {PRONOUNS_OPTIONS.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                    <ChangePasswordButton />
                </div>
            </Box2>
        </PageMain>
    )
}
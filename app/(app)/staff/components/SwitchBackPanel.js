'use client';

import { userActions, useUser } from "@/utils/store/useUser";
import { useRouter } from "next/navigation";

export default function SwitchBackPanel() {
    const originalUser = useUser(state => state.originalUser);
    const user = useUser(state => state.user);
    const router = useRouter();
    
    if (!originalUser) return null;

    const onClick = async () => {
        const lastPage = await userActions.switchBackToOriginal();
        if (lastPage) router.push(lastPage);
    }

    return (
        <div className="fixed z-[1000] bottom-0 left-0 right-0 w-full h-16 p-4 bg-destructive flex items-center justify-center text-white z-50 gap-4">
            הנך צופה בחשבון של {user.first_name} {user.last_name}
            <div className="bg-white text-destructive px-4 py-2 rounded hover:bg-red-200 hover:scale-105 transition-all cursor-pointer"
                onClick={onClick}
            >
                חזרה ל{originalUser.user.first_name} {originalUser.user.last_name}
            </div>
        </div>
    )
}
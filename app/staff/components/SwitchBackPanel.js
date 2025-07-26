'use client';

import { userActions, useUser } from "@/utils/useUser";

export default function SwitchBackPanel() {
    const originalUser = useUser(state => state.originalUser);
    const user = useUser(state => state.user);

    if (!originalUser) return null;

    return (
        <div className="fixed bottom-0 right-0 left-0 h-16 p-4 bg-red-500 flex items-center justify-center text-white z-50 gap-4">
            הנך צופה בחשבון של {user.firstName} {user.lastName}
            <div className="bg-white text-red-500 px-4 py-2 rounded hover:bg-red-200 hover:scale-105 transition-all cursor-pointer"
                onClick={userActions.switchBackToOriginal}
            >
                חזרה ל{originalUser.firstName} {originalUser.lastName}
            </div>
        </div>
    )
}
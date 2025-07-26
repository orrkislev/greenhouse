'use client';

import { userActions, useUser } from "@/utils/useUser";

export default function SwitchBackPanel() {
    const originalUser = useUser(state => state.originalUser);

    if (!originalUser) return null;

    return (
        <div className="fixed bottom-0 right-0 left-0 h-16 p-4 bg-red-500 flex items-center justify-center">
            <div className="bg-white text-red-500 px-4 py-2 rounded hover:bg-red-400 transition-colors cursor-pointer"
                onClick={userActions.switchBackToOriginal}
            >
                Switch back to {originalUser.firstName} {originalUser.lastName}
            </div>
        </div>
    )
}
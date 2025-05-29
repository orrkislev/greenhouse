'use client'

import WithAuth from "@/components/auth/SignIn"
import AdminListMembers from "./components/AdminListMembers"
import AdminGroups from "./components/AdminGroups"
import { useUser } from "@/utils/store/user"

export default function AdminPage() {

    return (
        <WithAuth role="admin">
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <AdminListMembers />
                <AdminGroups />
            </div>
        </WithAuth>
    )
}
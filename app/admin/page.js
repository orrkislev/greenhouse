'use client'

import WithAuth from "@/components/auth/SignIn"
import AdminGroups from "./components/AdminGroups"
import { useUser } from "@/utils/useUser"
import { useEffect, useState } from "react"
import AdminStaff from "./components/AdminStaff"
import { Button } from "@/components/ui/button"
import { getAllGroups, subscribeToGroups } from "./actions/group actions"
import { getAllMembers, subscribeToMembers } from "./actions/member actions"

export default function AdminPage() {
    const [groups, setGroups] = useState([]);
    const [students, setStudents] = useState([]);
    const [staff, setStaff] = useState([]);
    const signOut = useUser(state => state.signOut);

    useEffect(() => {
        (async () => {
            setGroups(await getAllGroups())
            const allMembers = await getAllMembers()
            setStudents(allMembers.students);
            setStaff(allMembers.staff);
        })()

        const unsubscribeMembers = subscribeToMembers(({ students, staff }) => {
            setStudents(students);
            setStaff(staff);
        });
        const unsubscribeGroups = subscribeToGroups(setGroups);

        return () => {
            unsubscribeMembers();
            unsubscribeGroups();
        }
    }, [])

    return (
        <WithAuth role="admin">
            <div className="flex items-center justify-center h-screen rtl flex-col gap-4 p-4">
                <div className="w-full max-w-5xl flex gap-4">
                    <AdminGroups groups={groups} students={students} staff={staff} />
                    <AdminStaff staff={staff} />
                </div>
                <div className="w-full max-w-5xl flex gap-4 flex items-center justify-center">
                    <Button
                        className="w-full max-w-xs bg-blue-500 text-white hover:bg-blue-600"
                        variant="outline"
                        onClick={signOut}
                    >
                        Sign Out
                    </Button>
                </div>
            </div>
        </WithAuth>
    )
}
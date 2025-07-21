'use client'

import WithAuth from "@/components/WithAuth"
import AdminGroups from "./components/AdminGroups"
import { useEffect, useState } from "react"
import AdminStaff from "./components/AdminStaff"
import { getAllGroups, subscribeToGroups } from "./actions/group actions"
import { getAllMembers, subscribeToMembers } from "./actions/member actions"
import AdminYearSchedule from "./components/AdminYearSchedule"

export default function AdminPage() {
    return (
        <WithAuth role="admin">
            <AdminPageActual />
        </WithAuth>
    )
}

export function AdminPageActual() {
    const [groups, setGroups] = useState([]);
    const [students, setStudents] = useState([]);
    const [staff, setStaff] = useState([]);

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
        <div className="rtl p-4 flex justify-center min-h-screen">
            <div className="w-full max-w-7xl flex flex-col gap-4">
                <div className="flex gap-2">
                    <AdminGroups groups={groups} students={students} staff={staff} />
                    <AdminStaff staff={staff} />
                </div>
                <AdminYearSchedule />
            </div>
        </div>
    )
}
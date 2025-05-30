'use client'

import WithAuth from "@/components/auth/SignIn"
import AdminListMembers from "./components/AdminListMembers"
import AdminGroups from "./components/AdminGroups"
import { useUser } from "@/utils/store/user"
import { useEffect, useState } from "react"
import { collection, getDocs, onSnapshot } from "firebase/firestore"
import { db } from "@/utils/firebase/firebase"
import AdminStaff from "./components/AdminStaff"
import { Button } from "@/components/ui/button"

export default function AdminPage() {
    const [groups, setGroups] = useState([]);
    const [students, setStudents] = useState([]);
    const [staff, setStaff] = useState([]);
    const signOut = useUser(state => state.signOut);

    useEffect(() => {
        const groupsCollection = collection(db, "groups");
        const membersCollection = collection(db, "users");
        (async () => {
            let allGroups = await getDocs(groupsCollection);
            allGroups = allGroups.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setGroups(allGroups);

            let allMembers = await getDocs(membersCollection);
            allMembers = allMembers.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const studentsList = allMembers.filter(member => !member.roles || member.roles.includes('student'));
            const staffList = allMembers.filter(member => member.roles && member.roles.includes('staff'));
            setStudents(studentsList);
            setStaff(staffList);
        })()

        const unsubscribeMembers = onSnapshot(membersCollection, snapshot => {
            const allMembers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const studentsList = allMembers.filter(member => !member.roles || member.roles.includes('student'));
            const staffList = allMembers.filter(member => member.roles && member.roles.includes('staff'));
            setStudents(studentsList);
            setStaff(staffList);
        })

        const unsubscribeGroups = onSnapshot(groupsCollection, snapshot => {
            const allGroups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setGroups(allGroups);
        })

        return () => {
            unsubscribeMembers();
            unsubscribeGroups();
        }
    }, [])

    return (
        <WithAuth role="admin">
            <div className="flex items-center justify-center h-screen bg-gray-100 rtl flex-col gap-4 p-4">
                <div className="w-full max-w-5xl flex gap-4">
                    <AdminGroups groups={groups} students={students} staff={staff} />
                    <AdminStaff groups={groups} staff={staff} />
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
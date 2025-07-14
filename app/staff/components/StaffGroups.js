'use client'

import { Users, Calendar, FolderOpen, X } from "lucide-react";
import AddGroupButton from "./AddGroupButton";
import { updateUserData } from "@/utils/firebase/firebase_data";
import { useUser } from "@/utils/useUser";
import { StudentCard } from "./StudentCard";
import { useMemo } from "react";

export default function StaffGroups({ students, mode }) {
    const user = useUser(state => state.user);
    
    const groups = useMemo(() => {
        if (!user || !user.groups || user.groups.length === 0) return {};
        const grouped = {};
        user.groups.forEach(groupName => {
            grouped[groupName] = {
                name: groupName,
                students: students.filter(student => student.className === groupName)
            };
        });
        return grouped;
    }, [students, user.groups]);

    return (
        <div className="space-y-6">
            {/* Groups Grid */}
            <div className="">
                {Object.values(groups).map((group) => (
                    <GroupCard
                        key={group.name}
                        group={group}
                        mode={mode}
                    />
                ))}
            </div>

            {Object.values(groups).length === 0 && (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-500 mb-2">אין קבוצות מוקצות</h3>
                    <p className="text-gray-400">בקש מהמנהל להקצות לך קבוצות או הוסף קבוצה</p>
                </div>
            )}

            {/* Add Group Button - Moved to the bottom */}
            <div className="mt-6 flex justify-center">
                <AddGroupButton groups={groups} />
            </div>
        </div>
    );
}

function GroupCard({ group, mode }) {
    const user = useUser(state => state.user);

    const getModeStyles = () => {
        if (mode === "schedule") {
            return {
                border: "border-green-200",
                header: "bg-green-50 text-green-800",
                accent: "text-green-600"
            };
        } else {
            return {
                border: "border-purple-200",
                header: "bg-purple-50 text-purple-800",
                accent: "text-purple-600"
            };
        }
    };

    const styles = getModeStyles();

    const onRemove = () => {
        updateUserData({ groups: user.groups.filter(g => g !== group.name) });
    }

    return (
        <div className={`bg-white rounded-lg shadow-sm border-2 ${styles.border} overflow-hidden hover:shadow-md transition-shadow`}>
            {/* Group Header */}
            <div className={`${styles.header} p-4 border-b`}>
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">{group.name}</h3>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span className="text-sm font-medium">{group.students.length}</span>
                        </div>
                        <button
                            onClick={onRemove}
                            className="p-1 hover:bg-red-100 rounded-full transition-colors"
                            title="הסר קבוצה"
                        >
                            <X className="w-4 h-4 text-red-600" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Students Grid */}
            <div className="p-4">
                <div className="flex flex-wrap gap-2">
                    {group.students
                        .sort((a, b) => a.firstName.localeCompare(b.firstName, 'he'))
                        .map((student) => (
                            <StudentCard
                                key={student.id}
                                student={student}
                                mode={mode}
                                styles={styles}
                            />
                        ))
                    }
                </div>
            </div>
        </div>
    );
}
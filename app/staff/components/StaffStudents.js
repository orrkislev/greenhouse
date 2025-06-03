'use client'

import { useState } from "react";
import { Search, Users, Calendar, FolderOpen, Filter } from "lucide-react";

export default function StaffStudents({ students, assignedGroups, mode }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedGroup, setSelectedGroup] = useState("all");

    // Get assigned group names
    const assignedGroupNames = assignedGroups.map(group => group.name);

    // Filter students based on assigned groups, search, and group selection
    const filteredStudents = students.filter(student => {
        // Only show students from assigned groups
        const isInAssignedGroup = assignedGroupNames.includes(student.className);
        if (!isInAssignedGroup) return false;

        // Apply search filter
        const matchesSearch = !searchTerm || 
            `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.className?.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Apply group filter
        const matchesGroup = selectedGroup === "all" || student.className === selectedGroup;
        
        return matchesSearch && matchesGroup;
    });

    const getModeIcon = () => {
        return mode === "schedule" ? <Calendar className="w-5 h-5" /> : <FolderOpen className="w-5 h-5" />;
    };

    const getModeColor = () => {
        return mode === "schedule" ? "text-green-600" : "text-purple-600";
    };

    const getModeStyles = () => {
        if (mode === "schedule") {
            return {
                border: "border-green-200",
                accent: "text-green-600",
                bg: "bg-green-50"
            };
        } else {
            return {
                border: "border-purple-200",
                accent: "text-purple-600",
                bg: "bg-purple-50"
            };
        }
    };

    const styles = getModeStyles();

    return (
        <div className="space-y-6">
            {/* Header and Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-gray-800">החניכים שלי</h2>
                        <div className={`flex items-center gap-2 ${getModeColor()}`}>
                            {getModeIcon()}
                            <span className="font-medium">
                                {mode === "schedule" ? "מצב לוח זמנים" : "מצב פרויקטים"}
                            </span>
                        </div>
                    </div>
                    <div className="text-sm text-gray-500">
                        סה&quot;כ {filteredStudents.length} חניכים
                    </div>
                </div>

                {assignedGroups.length === 0 ? (
                    <div className="text-center py-8">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 mb-2">אין לך קבוצות מוקצות</p>
                        <p className="text-sm text-gray-400">בקש מהמנהל להקצות לך קבוצות כדי לראות חניכים</p>
                    </div>
                ) : (
                    <>
                        {/* Search and Filter Controls */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* Search Input */}
                            <div className="relative flex-1">
                                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="חיפוש חניכים..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    dir="rtl"
                                />
                            </div>

                            {/* Group Filter */}
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-gray-500" />
                                <select
                                    value={selectedGroup}
                                    onChange={(e) => setSelectedGroup(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    dir="rtl"
                                >
                                    <option value="all">כל הקבוצות שלי</option>
                                    {assignedGroupNames.map(groupName => (
                                        <option key={groupName} value={groupName}>{groupName}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Students Grid */}
            {assignedGroups.length > 0 && (
                <>
                    {filteredStudents.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredStudents
                                .sort((a, b) => a.firstName.localeCompare(b.firstName, 'he'))
                                .map((student) => (
                                    <StudentDetailCard 
                                        key={student.id} 
                                        student={student} 
                                        mode={mode}
                                        styles={styles}
                                    />
                                ))
                            }
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-500 mb-2">
                                {searchTerm || selectedGroup !== "all" ? "לא נמצאו חניכים" : "אין חניכים בקבוצות שלך"}
                            </h3>
                            <p className="text-gray-400">
                                {searchTerm || selectedGroup !== "all" ? "נסה לשנות את מושגי החיפוש" : "החניכים יופיעו כאן כשיתווספו לקבוצות"}
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

function StudentDetailCard({ student, mode, styles }) {
    return (
        <div className={`bg-white rounded-lg shadow-sm border-2 ${styles.border} overflow-hidden hover:shadow-md transition-all hover:scale-105 cursor-pointer`}>
            {/* Student Header */}
            <div className={`${styles.bg} p-4 text-center`}>
                <div className="w-12 h-12 bg-white rounded-full mx-auto mb-3 flex items-center justify-center shadow-sm">
                    <span className="text-lg font-bold text-gray-700">
                        {student.firstName?.charAt(0) || '?'}
                    </span>
                </div>
                <h3 className="font-bold text-gray-800">
                    {student.firstName} {student.lastName}
                </h3>
                {student.className && (
                    <p className={`text-sm ${styles.accent} font-medium mt-1`}>
                        {student.className}
                    </p>
                )}
            </div>

            {/* Student Details */}
            <div className="p-4 space-y-3">
                {student.email && (
                    <div className="text-sm">
                        <span className="text-gray-500">מייל:</span>
                        <p className="text-gray-800 truncate">{student.email}</p>
                    </div>
                )}
                
                {student.phone && (
                    <div className="text-sm">
                        <span className="text-gray-500">טלפון:</span>
                        <p className="text-gray-800">{student.phone}</p>
                    </div>
                )}

                {/* Mode-specific information */}
                <div className="pt-3 border-t border-gray-100">
                    {mode === "schedule" ? (
                        <div className="flex items-center justify-center gap-2 text-green-600">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm font-medium">לוח זמנים</span>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-2 text-purple-600">
                            <FolderOpen className="w-4 h-4" />
                            <span className="text-sm font-medium">פרויקטים</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

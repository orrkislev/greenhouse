'use client'

import { groupsActions, useGroups } from "@/utils/store/useGroups";
import { eventsActions, useEvents } from "@/utils/store/useEvents";
import { projectActions, useProject } from "@/utils/store/useProject";
import { researchActions, useResearch } from "@/utils/store/useResearch";
import { studyActions, useStudy } from "@/utils/store/useStudy";
import { mentorshipsActions, useMentorships } from "@/utils/store/useMentorships";
import { useTime } from "@/utils/store/useTime";
import { use, useEffect, useState } from "react";
import { format } from 'date-fns';

// Student Card Component
function StudentCard({ student, viewMode, onStudentClick }) {
    const today = useTime(state => state.today);
    const todayStr = format(today, 'yyyy-MM-dd');

    // Get student-specific data from stores
    const events = useEvents(state => state.events[todayStr] || []);
    const studentEvents = events.filter(event =>
        event.members?.includes(student.id) ||
        event.other_participants?.some(p => p.id === student.id)
    );

    const allProjects = useProject(state => state.allProjects || []);
    const studentProject = allProjects.find(p => p.student_id === student.id && p.status === 'active');

    const allResearch = useResearch(state => state.allResearch || []);
    const studentResearch = allResearch.find(r => r.student_id === student.id && r.status === 'active');

    const paths = useStudy(state => state.paths || []);
    const studentPaths = paths.filter(p => p.student_id === student.id && p.status === 'active');

    const mentorships = useMentorships(state => state.mentorships || []);
    const studentMentorships = mentorships.filter(m => m.student_id === student.id);

    // Calculate research completion percentage
    const getResearchCompletion = (research) => {
        if (!research?.sections) return 0;
        const totalSections = Object.keys(research.sections).length;
        if (totalSections === 0) return 0;
        const filledSections = Object.values(research.sections).filter(s => s && s.trim()).length;
        return Math.round((filledSections / totalSections) * 100);
    };

    return (
        <div
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer border-2 border-gray-200"
            onClick={() => onStudentClick(student)}
        >
            {/* Student Header */}
            <div className="flex items-center gap-4 mb-4 pb-4 border-b-2 border-gray-200">
                {student.avatar_url ? (
                    <img
                        src={student.avatar_url}
                        alt={`${student.first_name} ${student.last_name}`}
                        className="w-16 h-16 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                        {student.first_name?.[0]}{student.last_name?.[0]}
                    </div>
                )}
                <div>
                    <h3 className="text-2xl font-bold text-gray-800">
                        {student.first_name} {student.last_name}
                    </h3>
                    <p className="text-sm text-gray-500">{student.username}</p>
                </div>
            </div>

            {/* Content based on view mode */}
            <div className="min-h-[200px]">
                {viewMode === 'schedule' && (
                    <div>
                        <h4 className="text-lg font-semibold mb-3 text-blue-600">לוח זמנים להיום</h4>
                        {studentEvents.length > 0 ? (
                            <div className="space-y-2">
                                {studentEvents.map(event => (
                                    <div key={event.id} className="bg-blue-50 p-3 rounded border-r-4 border-blue-500">
                                        <div className="flex justify-between items-start">
                                            <span className="font-semibold text-gray-800">{event.title}</span>
                                            <span className="text-sm text-gray-600">{event.start} - {event.end}</span>
                                        </div>
                                        {event.description && (
                                            <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400 text-center py-8">אין אירועים להיום</p>
                        )}
                    </div>
                )}

                {viewMode === 'project' && (
                    <div>
                        <h4 className="text-lg font-semibold mb-3 text-green-600">פרויקט נוכחי</h4>
                        {studentProject ? (
                            <div>
                                <div className="bg-green-50 p-4 rounded-lg mb-3">
                                    <h5 className="font-bold text-xl text-gray-800 mb-2">{studentProject.title}</h5>
                                    {studentProject.description && (
                                        <p className="text-sm text-gray-600 mb-3">{studentProject.description}</p>
                                    )}

                                    {/* Mentoring Master */}
                                    {studentMentorships.length > 0 && (
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-sm font-semibold text-gray-700">מנטור:</span>
                                            <div className="flex gap-2">
                                                {studentMentorships.map(m => m.mentor).filter(Boolean).map(mentor => (
                                                    <span key={mentor.id} className="text-sm bg-white px-2 py-1 rounded shadow-sm">
                                                        {mentor.first_name} {mentor.last_name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Next Task */}
                                    {studentProject.tasks && studentProject.tasks.length > 0 && (
                                        <div className="mt-3">
                                            <span className="text-sm font-semibold text-gray-700">משימה הבאה:</span>
                                            {studentProject.tasks
                                                .filter(t => t.status !== 'completed')
                                                .slice(0, 1)
                                                .map(task => (
                                                    <div key={task.id} className="bg-white p-2 rounded mt-1 shadow-sm">
                                                        <p className="font-medium text-gray-800">{task.title}</p>
                                                        {task.description && (
                                                            <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                                                        )}
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-400 text-center py-8">אין פרויקט פעיל</p>
                        )}
                    </div>
                )}

                {viewMode === 'research' && (
                    <div>
                        <h4 className="text-lg font-semibold mb-3 text-purple-600">מחקר</h4>
                        {studentResearch ? (
                            <div className="bg-purple-50 p-4 rounded-lg">
                                <h5 className="font-bold text-xl text-gray-800 mb-3">{studentResearch.title}</h5>

                                {/* Completion Bar */}
                                <div className="mb-3">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-semibold text-gray-700">השלמה</span>
                                        <span className="text-sm font-bold text-purple-600">
                                            {getResearchCompletion(studentResearch)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all"
                                            style={{ width: `${getResearchCompletion(studentResearch)}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Sections Overview */}
                                {studentResearch.sections && (
                                    <div className="grid grid-cols-2 gap-2 mt-3">
                                        {Object.entries(studentResearch.sections).map(([key, value]) => (
                                            <div
                                                key={key}
                                                className={`p-2 rounded text-xs ${
                                                    value && value.trim()
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-500'
                                                }`}
                                            >
                                                {value && value.trim() ? '✓' : '○'} {key}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-400 text-center py-8">אין מחקר פעיל</p>
                        )}
                    </div>
                )}

                {viewMode === 'learning' && (
                    <div>
                        <h4 className="text-lg font-semibold mb-3 text-orange-600">למידה</h4>
                        {studentPaths.length > 0 ? (
                            <div className="space-y-3">
                                {studentPaths.map(path => (
                                    <div key={path.id} className="bg-orange-50 p-4 rounded-lg">
                                        <h5 className="font-bold text-lg text-gray-800 mb-2">{path.title}</h5>
                                        {path.description && (
                                            <p className="text-sm text-gray-600 mb-2">{path.description}</p>
                                        )}

                                        {/* Steps/Tasks */}
                                        {path.steps && path.steps.length > 0 && (
                                            <div className="mt-2">
                                                <div className="flex gap-2 text-xs">
                                                    <span className="font-semibold text-gray-700">
                                                        {path.steps.filter(s => s.status === 'completed').length} / {path.steps.length} משימות הושלמו
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                                    <div
                                                        className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all"
                                                        style={{
                                                            width: `${(path.steps.filter(s => s.status === 'completed').length / path.steps.length) * 100}%`
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400 text-center py-8">אין מסלולי למידה פעילים</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// Student Detail Modal
function StudentDetailModal({ student, onClose }) {
    const today = useTime(state => state.today);
    const todayStr = format(today, 'yyyy-MM-dd');

    const events = useEvents(state => state.events[todayStr] || []);
    const studentEvents = events.filter(event =>
        event.members?.includes(student.id) ||
        event.other_participants?.some(p => p.id === student.id)
    );

    const allProjects = useProject(state => state.allProjects || []);
    const studentProject = allProjects.find(p => p.student_id === student.id && p.status === 'active');

    const allResearch = useResearch(state => state.allResearch || []);
    const studentResearch = allResearch.find(r => r.student_id === student.id && r.status === 'active');

    const paths = useStudy(state => state.paths || []);
    const studentPaths = paths.filter(p => p.student_id === student.id && p.status === 'active');

    const mentorships = useMentorships(state => state.mentorships || []);
    const studentMentorships = mentorships.filter(m => m.student_id === student.id);

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-8"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-t-xl">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            {student.avatar_url ? (
                                <img
                                    src={student.avatar_url}
                                    alt={`${student.first_name} ${student.last_name}`}
                                    className="w-20 h-20 rounded-full object-cover border-4 border-white"
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-full bg-white bg-opacity-30 flex items-center justify-center text-3xl font-bold">
                                    {student.first_name?.[0]}{student.last_name?.[0]}
                                </div>
                            )}
                            <div>
                                <h2 className="text-3xl font-bold">
                                    {student.first_name} {student.last_name}
                                </h2>
                                <p className="text-blue-100">{student.username}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Schedule */}
                    <section>
                        <h3 className="text-2xl font-bold text-blue-600 mb-4 flex items-center gap-2">
                            <span>📅</span> לוח זמנים להיום
                        </h3>
                        {studentEvents.length > 0 ? (
                            <div className="space-y-3">
                                {studentEvents.map(event => (
                                    <div key={event.id} className="bg-blue-50 p-4 rounded-lg border-r-4 border-blue-500">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold text-lg text-gray-800">{event.title}</span>
                                            <span className="text-blue-600 font-semibold">{event.start} - {event.end}</span>
                                        </div>
                                        {event.description && (
                                            <p className="text-gray-600">{event.description}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400 text-center py-4">אין אירועים להיום</p>
                        )}
                    </section>

                    {/* Project */}
                    <section>
                        <h3 className="text-2xl font-bold text-green-600 mb-4 flex items-center gap-2">
                            <span>🚀</span> פרויקט
                        </h3>
                        {studentProject ? (
                            <div className="bg-green-50 p-5 rounded-lg">
                                <h4 className="font-bold text-2xl text-gray-800 mb-3">{studentProject.title}</h4>
                                {studentProject.description && (
                                    <p className="text-gray-600 mb-4">{studentProject.description}</p>
                                )}

                                {studentMentorships.length > 0 && (
                                    <div className="mb-4">
                                        <span className="font-semibold text-gray-700">מנטורים: </span>
                                        {studentMentorships.map(m => m.mentor).filter(Boolean).map(mentor => (
                                            <span key={mentor.id} className="inline-block bg-white px-3 py-1 rounded-full shadow-sm mr-2">
                                                {mentor.first_name} {mentor.last_name}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {studentProject.tasks && studentProject.tasks.length > 0 && (
                                    <div>
                                        <h5 className="font-semibold text-gray-700 mb-2">משימות:</h5>
                                        <div className="space-y-2">
                                            {studentProject.tasks.map(task => (
                                                <div
                                                    key={task.id}
                                                    className={`p-3 rounded ${
                                                        task.status === 'completed'
                                                            ? 'bg-green-100 line-through text-gray-500'
                                                            : 'bg-white shadow-sm'
                                                    }`}
                                                >
                                                    <p className="font-medium">{task.title}</p>
                                                    {task.description && (
                                                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-400 text-center py-4">אין פרויקט פעיל</p>
                        )}
                    </section>

                    {/* Research */}
                    <section>
                        <h3 className="text-2xl font-bold text-purple-600 mb-4 flex items-center gap-2">
                            <span>🔬</span> מחקר
                        </h3>
                        {studentResearch ? (
                            <div className="bg-purple-50 p-5 rounded-lg">
                                <h4 className="font-bold text-2xl text-gray-800 mb-4">{studentResearch.title}</h4>

                                {studentResearch.sections && (
                                    <div className="space-y-2">
                                        {Object.entries(studentResearch.sections).map(([key, value]) => (
                                            <div
                                                key={key}
                                                className={`p-3 rounded flex items-start gap-3 ${
                                                    value && value.trim()
                                                        ? 'bg-green-100'
                                                        : 'bg-white'
                                                }`}
                                            >
                                                <span className="text-2xl">
                                                    {value && value.trim() ? '✅' : '⭕'}
                                                </span>
                                                <div className="flex-1">
                                                    <h5 className="font-semibold text-gray-800">{key}</h5>
                                                    {value && value.trim() && (
                                                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{value}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-400 text-center py-4">אין מחקר פעיל</p>
                        )}
                    </section>

                    {/* Learning */}
                    <section>
                        <h3 className="text-2xl font-bold text-orange-600 mb-4 flex items-center gap-2">
                            <span>📚</span> למידה
                        </h3>
                        {studentPaths.length > 0 ? (
                            <div className="space-y-4">
                                {studentPaths.map(path => (
                                    <div key={path.id} className="bg-orange-50 p-5 rounded-lg">
                                        <h4 className="font-bold text-xl text-gray-800 mb-2">{path.title}</h4>
                                        {path.description && (
                                            <p className="text-gray-600 mb-3">{path.description}</p>
                                        )}

                                        {path.steps && path.steps.length > 0 && (
                                            <div>
                                                <h5 className="font-semibold text-gray-700 mb-2">משימות:</h5>
                                                <div className="space-y-2">
                                                    {path.steps.map(step => (
                                                        <div
                                                            key={step.id}
                                                            className={`p-3 rounded ${
                                                                step.status === 'completed'
                                                                    ? 'bg-green-100 line-through text-gray-500'
                                                                    : 'bg-white shadow-sm'
                                                            }`}
                                                        >
                                                            <p className="font-medium">{step.title}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400 text-center py-4">אין מסלולי למידה פעילים</p>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}

// Main Screen Page
export default function ScreenPage({ params }) {
    const { groupId } = use(params);
    const groups = useGroups(state => state.groups);
    const group = groups.find(g => g.id === groupId);

    const [viewMode, setViewMode] = useState('schedule'); // schedule, project, research, learning
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load all necessary data
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);

            if (!group) {
                await groupsActions.loadUserGroups();
                return;
            }

            // Load group members
            if (!group.members || group.members.length === 0) {
                await groupsActions.loadClassMembers(group);
            }

            // Load data for all students in parallel
            if (group.members && group.members.length > 0) {
                const today = format(new Date(), 'yyyy-MM-dd');

                // Load events for today
                await eventsActions.loadTodayEvents();

                // Load projects, research, study paths, and mentorships
                await Promise.all([
                    projectActions.loadAllProjects(),
                    researchActions.loadAllResearch(),
                    studyActions.loadAllPaths?.() || Promise.resolve(),
                    mentorshipsActions.getAllStudents(),
                ]);
            }

            setIsLoading(false);
        };

        loadData();
    }, [group?.id]);

    if (!group) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-700 mb-4">אוי לא מצאנו את הקבוצה</h1>
                    <p className="text-gray-500">נסה לרענן את הדף</p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
                    <h2 className="text-2xl font-semibold text-gray-700">טוען נתונים...</h2>
                </div>
            </div>
        );
    }

    const students = group.members || [];

    return (
        <div className="h-screen w-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-y-auto">
            {/* Header */}
            <header className="bg-white shadow-lg sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-4xl font-bold text-gray-800">{group.name}</h1>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">עודכן ב-{format(new Date(), 'HH:mm')}</p>
                            <p className="text-lg font-semibold text-gray-700">{format(new Date(), 'dd/MM/yyyy')}</p>
                        </div>
                    </div>

                    {/* View Mode Toggles */}
                    <div className="flex gap-3 flex-wrap">
                        <button
                            onClick={() => setViewMode('schedule')}
                            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                                viewMode === 'schedule'
                                    ? 'bg-blue-500 text-white shadow-lg scale-105'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            📅 לוח זמנים
                        </button>
                        <button
                            onClick={() => setViewMode('project')}
                            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                                viewMode === 'project'
                                    ? 'bg-green-500 text-white shadow-lg scale-105'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            🚀 פרויקטים
                        </button>
                        <button
                            onClick={() => setViewMode('research')}
                            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                                viewMode === 'research'
                                    ? 'bg-purple-500 text-white shadow-lg scale-105'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            🔬 מחקר
                        </button>
                        <button
                            onClick={() => setViewMode('learning')}
                            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                                viewMode === 'learning'
                                    ? 'bg-orange-500 text-white shadow-lg scale-105'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            📚 למידה
                        </button>
                    </div>
                </div>
            </header>

            {/* Students Grid */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {students.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {students.map(student => (
                            <StudentCard
                                key={student.id}
                                student={student}
                                viewMode={viewMode}
                                onStudentClick={setSelectedStudent}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-2xl text-gray-400">אין תלמידים בקבוצה</p>
                    </div>
                )}
            </main>

            {/* Student Detail Modal */}
            {selectedStudent && (
                <StudentDetailModal
                    student={selectedStudent}
                    onClose={() => setSelectedStudent(null)}
                />
            )}
        </div>
    );
}

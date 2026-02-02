'use client'

import { DashboardLayout, DashboardMain } from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { toastsActions } from "@/utils/store/useToasts";
import SmartText from "@/components/SmartText";
import Button from "@/components/Button";

export default function EnglishReportPage() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingIds, setSavingIds] = useState(new Set());
    const [classFilter, setClassFilter] = useState('all');

    useEffect(() => {
        loadStudents();
    }, []);

    const loadStudents = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('report_cards_public')
            .select('id, first_name, last_name, class, learning')
            .order('class', { ascending: true })
            .order('last_name', { ascending: true });

        if (error) {
            toastsActions.addFromError(error, 'שגיאה בטעינת התלמידים');
            setLoading(false);
            return;
        }

        setStudents(data || []);
        setLoading(false);
    };

    const handleSave = async (studentId, englishMasterReview) => {
        setSavingIds(prev => new Set([...prev, studentId]));

        // Get the current learning object for this student
        const student = students.find(s => s.id === studentId);
        const updatedLearning = {
            ...student.learning,
            englishMasterReview
        };

        const { error } = await supabase
            .from('report_cards_private')
            .update({ learning: updatedLearning })
            .eq('id', studentId);

        if (error) {
            toastsActions.addFromError(error, 'שגיאה בשמירת המשוב');
        } else {
            // Update local state
            setStudents(prev => prev.map(s =>
                s.id === studentId
                    ? { ...s, learning: updatedLearning }
                    : s
            ));
            toastsActions.addToast({ message: 'נשמר בהצלחה!', type: 'success' });
        }

        setSavingIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(studentId);
            return newSet;
        });
    };

    const updateStudentReview = (studentId, review) => {
        setStudents(prev => prev.map(s =>
            s.id === studentId
                ? {
                    ...s,
                    learning: {
                        ...s.learning,
                        englishMasterReview: review
                    }
                }
                : s
        ));
    };

    const classes = [...new Set(students.map(s => s.class).filter(Boolean))].sort();
    const filteredStudents = classFilter === 'all'
        ? students
        : students.filter(s => s.class === classFilter);

    if (loading) {
        return (
            <DashboardLayout>
                <DashboardMain>
                    <div className="flex items-center justify-center h-full">
                        <div className="text-2xl text-gray-500">טוען...</div>
                    </div>
                </DashboardMain>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <DashboardMain>
                <div className="px-8 py-6">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold mb-4">משוב מאסטר אנגלית</h1>

                        {/* Class Filter */}
                        <div className="flex gap-2 mb-4">
                            <button
                                onClick={() => setClassFilter('all')}
                                className={`px-4 py-2 rounded ${
                                    classFilter === 'all'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                כל הקבוצות
                            </button>
                            {classes.map(cls => (
                                <button
                                    key={cls}
                                    onClick={() => setClassFilter(cls)}
                                    className={`px-4 py-2 rounded ${
                                        classFilter === cls
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    {cls}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Students List */}
                    <div className="space-y-4">
                        {filteredStudents.map(student => (
                            <div
                                key={student.id}
                                className="border-2 border-gray-300 rounded-lg p-4 bg-white hover:border-gray-400 transition-colors"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="min-w-[200px]">
                                        <div className="font-bold text-lg">
                                            {student.first_name} {student.last_name}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            כיתה {student.class}
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <SmartText
                                            text={student.learning?.englishMasterReview || ''}
                                            onEdit={(newText) => updateStudentReview(student.id, newText)}
                                            editable={true}
                                            withIcon={true}
                                            className="text-sm"
                                            placeholder="הוסף משוב מאסטר אנגלית..."
                                        />
                                    </div>

                                    <div className="min-w-[100px]">
                                        <Button
                                            onClick={() => handleSave(
                                                student.id,
                                                student.learning?.englishMasterReview || ''
                                            )}
                                            disabled={savingIds.has(student.id)}
                                            className="w-full"
                                        >
                                            {savingIds.has(student.id) ? 'שומר...' : 'שמירה'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {filteredStudents.length === 0 && (
                            <div className="text-center text-gray-500 py-8">
                                לא נמצאו תלמידים
                            </div>
                        )}
                    </div>
                </div>
            </DashboardMain>
        </DashboardLayout>
    );
}

'use client'

import { useEffect, useState } from "react";
import { useUser } from "@/utils/store/user";
import { Button } from "@/components/ui/button";
import { ArrowBigLeftDash } from "lucide-react";
import QuestionCard from "./QuestionCard";
import { useProject } from "@/utils/store/projectStore";

// Questions configuration object
const QUESTIONS = [
    {
        key: 'generalDirection',
        title: 'הכיוון הכללי',
        description: 'לפחות שלושה משפטים. ניתן להתייחס לתחום לימוד, תוצר רצוי, מיומנות וכו בהם אתם מתכננים לעסוק:',
        placeholder: 'אני מאוד רוצה...'
    }, {
        key: 'whySubject',
        title: 'למה בחרתי בנושא',
        description: 'פרטו בשלושה משפטים לפחות: זה מעניין אותי/ אני רוצה להתפתח מקצועית בתחום/ עונה על שאלה שמטרידה אותי/ חשוב לי מסיבות ערכיות/ כי זה קל/ כי זה קשה וכד.',
        placeholder: 'תמיד אהבתי...'
    }, {
        key: 'requestedMaster',
        title: 'מנחה מבוקש.ת',
        description: 'שם, ומה התרומה הצפויה בפרויקט',
        placeholder: 'יהיה לי טוב עם...'
    },
    {
        key: 'myContributions',
        title: 'התרומות שלי',
        description: 'תארכו לשותפים ולמנחים באיזה היבטים תוכלו לתרום לפרויקט',
        placeholder: 'אני מאוד רוצה לתרום...'
    }, {
        key: 'systemGuide',
        title: 'המעודה המערכתית שלי',
        description: 'שמותיה של בפרויקט הזה',
        placeholder: 'תמיד אהבתי...'
    }, {
        key: 'note',
        title: 'לכמה זה מגניב?',
        description: 'שני מזה הפרויקט מקליפורניה הטבעים שמועצת הפרויקט',
        placeholder: 'יהיה לי טוב עם...'
    }
]

export default function ProjectIntentions() {
    const project = useProject((state) => state.project);
    const setProject = useProject((state) => state.setProject);
    const setView = useProject((state) => state.setView);
    const user = useUser((state) => state.user);

    useEffect(() => {
        if (!project.questions || !project.intentions) {
            setProject({
                name: '',
                questions: QUESTIONS.slice(0, 3),
                intentions: {}
            })
        }
    }, [project]);

    if (!project.questions || !project.intentions) return null

    const getQuestionComponent = (question) => (
        <QuestionCard
            key={question.key}
            question={question}
            value={project.intentions[question.key]}
            onSave={(value) => {
                setProject({
                    intentions: {
                        ...project.intentions,
                        [question.key]: value
                    }
                })
                if (project.questions.length < QUESTIONS.length) {
                    setProject({ questions: QUESTIONS.slice(0, project.questions.length + 1) });
                }
            }}
        />
    );

    const goToProjectManagement = () => {
        setView('overview');
    }
    const firstThreeFilled = QUESTIONS.slice(0, 3).every(q => project.intentions[q.key] && project.intentions[q.key].trim() !== '');
    return (
        <div className='rtl'>
            {/* Top Bar */}
            <div className="flex items-center justify-between max-w-6xl mx-auto mb-8">
                <div className="text-2xl font-bold text-gray-800">הצהרת כוונות</div>
                <Button disabled={!firstThreeFilled} onClick={goToProjectManagement}>
                    ניהול הפרויקט
                    <ArrowBigLeftDash className="ml-2" size={16} />
                </Button>
            </div>
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="bg-white rounded-lg shadow p-6 flex flex-col min-w-[260px] w-full">
                    <div className="font-semibold text-lg mb-2">שם הפרויקט</div>
                    <input
                        type="text"
                        defaultValue={project.name}
                        onBlur={(e) => setProject({ name: e.target.value })}
                        placeholder={`הפרויקט המגניב של ${user.firstName || ''}`}
                        dir="rtl"
                        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>

                <div className="flex gap-6 w-full">
                    <div className="flex flex-1 gap-6">
                        <div className="flex flex-col gap-6 flex-1">
                            {project.questions.filter((_, index) => index % 3 === 0).map(getQuestionComponent)}
                        </div>
                        <div className="flex flex-col gap-6 flex-1">
                            {project.questions.filter((_, index) => index % 3 === 1).map(getQuestionComponent)}
                        </div>
                        <div className="flex flex-col gap-6 flex-1">
                            {project.questions.filter((_, index) => index % 3 === 2).map(getQuestionComponent)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

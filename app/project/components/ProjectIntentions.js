'use client'

import { useEffect, useState } from "react";
import QuestionCard from "./QuestionCard";
import { projectActions, useProject } from "@/utils/useProject";
import { useUser } from "@/utils/useUser";

const QUESTIONS = [
    {
        title: 'הכיוון הכללי',
        description: 'לפחות שלושה משפטים. ניתן להתייחס לתחום לימוד, תוצר רצוי, מיומנות וכו בהם אתם מתכננים לעסוק:',
        placeholder: 'אני מאוד רוצה...'
    }, {
        title: 'למה בחרתי בנושא',
        description: 'פרטו בשלושה משפטים לפחות: זה מעניין אותי/ אני רוצה להתפתח מקצועית בתחום/ עונה על שאלה שמטרידה אותי/ חשוב לי מסיבות ערכיות/ כי זה קל/ כי זה קשה וכד.',
        placeholder: 'תמיד אהבתי...'
    }, {
        title: 'מנחה מבוקש.ת',
        description: 'שם, ומה התרומה הצפויה בפרויקט',
        placeholder: 'יהיה לי טוב עם...'
    },
]

export default function ProjectIntentions() {
    const user = useUser(state => state.user)
    const project = useProject((state) => state.project);
    const [questions, setQuestions] = useState(QUESTIONS);

    useEffect(() => {
        if (project && project.questions) {
            setQuestions(project.questions)
        }
    }, [project]);

    const saveQuestionValue = (index, value) => {
        const newQuestions = [...questions];
        newQuestions[index].value = value;
        setQuestions(newQuestions);
        projectActions.updateProject({ questions: newQuestions });
    };

    const filledThreeQuestions = questions.slice(0, 3).every(q => q.value && q.value.trim() !== '');

    return (
        <div className='rtl'>
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="bg-white rounded-lg shadow p-6 flex flex-col min-w-[260px] w-full">
                    <div className="font-semibold text-lg mb-2">שם הפרויקט</div>
                    <input
                        type="text"
                        defaultValue={project.name || ''}
                        onBlur={(e) => projectActions.updateProject({ name: e.target.value })}
                        placeholder={`הפרויקט המגניב של ${user.firstName || ''}`}
                        dir="rtl"
                        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>

                <div className="flex gap-6 w-full">
                    <div className="flex flex-1 gap-6">
                        {questions.map((question, index) => (
                            <QuestionCard
                                key={index}
                                question={question}
                                value={question.value || ''}
                                onSave={(value) => saveQuestionValue(index, value)}
                            />
                        ))}
                    </div>
                </div>
                <div className="text-gray-500 text-sm mt-4 text-center">
                    {filledThreeQuestions ?
                        'מעולה! עכשיו מחכים לשיבוץ המנחה שלך כדי להמשיך לפרויקט' :
                        'יש להשלים לפחות שלושה שאלות כדי להמשיך לפרויקט'
                    }
                </div>
            </div>
        </div>
    );
}

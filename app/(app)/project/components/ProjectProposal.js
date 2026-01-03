'use client'

import { useEffect, useMemo, useState } from "react";
import QuestionCard from "./QuestionCard";
import { projectActions, useProjectData } from "@/utils/store/useProject";
import { isStaff, useUser } from "@/utils/store/useUser";
import { adminActions } from "@/utils/store/useAdmin";
import Button from "@/components/Button";
import { Cat } from "lucide-react";

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

export default function ProjectProposal() {
    const user = useUser(state => state.user)
    const project = useProjectData(state => state.project);
    const [questions, setQuestions] = useState(QUESTIONS);


    useEffect(() => {
        if (project && project.metadata?.questions) {
            setQuestions(project.metadata.questions)
        }
    }, [project]);

    const filledThreeQuestions = useMemo(() => questions.slice(0, 3).every(q => q.value && q.value.trim() !== ''), [questions]);

    useEffect(() => {
        if (filledThreeQuestions) {
            projectActions.completeTaskByTitle('הצהרת כוונות');
        }
    }, [filledThreeQuestions])

    const saveQuestionValue = (index, value) => {
        const newQuestions = [...questions];
        newQuestions[index].value = value;
        setQuestions(newQuestions);
        projectActions.updateMetadata({ questions: newQuestions });
    };

    return (
        <div className='rtl'>
            <div className="max-w-6xl mx-auto space-y-6">
                {/* <div>
                    <div className="font-semibold text-lg mb-2">שם הפרויקט</div>
                    <input
                        type="text"
                        defaultValue={project.title || ''}
                        onBlur={(e) => projectActions.updateProject({ title: e.target.value })}
                        placeholder={project.title}
                        dir="rtl"
                        className="bg-white w-full border border-border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div> */}

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
                <div className="text-muted-foreground text-sm mt-4 text-center">
                    {filledThreeQuestions ?
                        'מעולה! עכשיו מחכים לשיבוץ המנחה שלך כדי להמשיך לפרויקט' :
                        'יש להשלים לפחות שלוש שאלות כדי להמשיך לפרויקט'
                    }
                </div>
            </div>

        </div>
    );
}

'use client'

import { useEffect, useMemo, useState } from "react";
import QuestionCard from "./QuestionCard";
import { projectActions, useProjectData } from "@/utils/store/useProject";
import Box2 from "@/components/Box2";
import GooeySlider from "@/components/GooeySlider";
import { Brain } from "lucide-react";

const QUESTIONS = [
    {
        key: 'general_direction',
        title: 'הכיוון הכללי',
        description: 'לפחות שלושה משפטים. ניתן להתייחס לתחום לימוד, תוצר רצוי, מיומנות וכו בהם אתם מתכננים לעסוק:',
        placeholder: 'אני מאוד רוצה...'
    }, {
        key: 'motivation',
        title: 'למה בחרתי בנושא',
        description: 'פרטו בשלושה משפטים לפחות: זה מעניין אותי/ אני רוצה להתפתח מקצועית בתחום/ עונה על שאלה שמטרידה אותי/ חשוב לי מסיבות ערכיות/ כי זה קל/ כי זה קשה וכד.',
        placeholder: 'תמיד אהבתי...'
    }, {
        key: 'mentor',
        title: 'מנחה מבוקש.ת',
        description: 'שם, ומה התרומה הצפויה בפרויקט',
        placeholder: 'יהיה לי טוב עם...'
    },
]

const sliders = [
    {
        "sectionName": "שאלות",
        "icon": Brain,
        "color": "#005f73",
        "parameters": [
            {
                "id": "project_type",
                "value1": "פרויקט התנסותי",
                "value2": "פרויקט מקצועי",
                "midValues": ["התנסות", "חובבני", "מעמיק", "מקצועי"]
            },
            {
                "id": "focus",
                "value1": "התמקדות בתהליך",
                "value2": "התמקדות בתוצאה",
                "midValues": []
            },
            {
                "id": "experience_level",
                "value1": "יש לי מעט ניסיון",
                "value2": "יש לי הרבה ניסיון",
                "midValues": []
            },
            {
                "id": "difficulty",
                "value1": "נראה לי קל",
                "value2": "נראה לי קשה",
                "midValues": []
            }
        ]
    },
]

const getSliderDefaults = () => sliders.reduce((acc, section) => ({
    ...acc,
    ...section.parameters.reduce((paramAcc, param) => ({
        ...paramAcc,
        [param.id]: 50,
    }), {})
}), {});

export default function ProjectProposal() {
    const project = useProjectData(state => state.project);
    const [questions, setQuestions] = useState(QUESTIONS);
    const [sliderValues, setSliderValues] = useState(getSliderDefaults);
    const [sliderDirty, setSliderDirty] = useState(false);


    useEffect(() => {
        if (project?.metadata) {
            setQuestions(QUESTIONS.map((question) => ({
                ...question,
                value: project.metadata?.[question.key] || ''
            })));

            const defaults = getSliderDefaults();
            const nextValues = { ...defaults };
            sliders.forEach((section) => {
                section.parameters.forEach((param) => {
                    if (project.metadata?.[param.id] !== undefined) {
                        nextValues[param.id] = project.metadata[param.id];
                    }
                });
            });
            setSliderValues(nextValues);
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
        const key = newQuestions[index].key;
        newQuestions[index].value = value;
        setQuestions(newQuestions);
        projectActions.updateMetadata({ [key]: value });
    };

    const handleSliderChange = (paramId, value) => {
        setSliderValues((prev) => ({
            ...prev,
            [paramId]: value,
        }));
        setSliderDirty(true);
    };

    useEffect(() => {
        if (!sliderDirty) return;
        const timeout = setTimeout(() => {
            projectActions.updateMetadata({ ...sliderValues });
            setSliderDirty(false);
        }, 500);

        return () => clearTimeout(timeout);
    }, [sliderValues, sliderDirty]);

    return (
        <div className='rtl'>
            <div className="max-w-6xl mx-auto space-y-6">

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

                <div className="flex flex-col gap-4">
                    {sliders.map((section) => (
                        <Box2 key={section.sectionName} label={section.sectionName} LabelIcon={section.icon}>
                            <div className='flex flex-col gap-4 divide-y divide-stone-300/50'>
                                {section.parameters.map((param) => (
                                    <div key={param.id} className="flex gap-2 pr-8 pb-2">
                                        <GooeySlider
                                            min={0}
                                            max={100}
                                            value={sliderValues[param.id] ?? 50}
                                            onChange={(value) => handleSliderChange(param.id, value)}
                                            labelLeft={param.value1}
                                            labelRight={param.value2}
                                            midValues={param.midValues}
                                            color={section.color}
                                        />
                                    </div>
                                ))}
                            </div>
                        </Box2>
                    ))}
                </div>
            </div>

        </div>
    );
}

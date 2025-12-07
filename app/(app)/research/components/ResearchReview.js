'use client';
import { useEffect, useState } from "react";
import WithLabel from "@/components/WithLabel";
import { Brain, FileText, HandCoins, Heart, Loader, Microscope, Pin, Save, Search, Sparkles } from "lucide-react";
import Box2 from "@/components/Box2";
import Button from "@/components/Button";
import GooeySlider from "@/components/GooeySlider";
import { researchActions, useResearchData } from "@/utils/store/useResearch";
import { useTime } from "@/utils/store/useTime";

const sections = [
    {
        "sectionName": "בחירת הנושא",
        "icon": Pin,
        "color": "#005f73",
        "parameters": [
            {
                "id": "project_related",
                "value1": "מחזק את הפרויקט",
                "value2": "לא קשור לפרויקט",
            },
            {
                "id": "question_quality",
                "value1": "שאלת מחקר כללית",
                "value2": "שאלה ממוקדת ומפתיעה",
                "midValues": ["רחבה", "ברורה", "ממוקדת", "מעמיקה"]
            }
        ]
    },
    {
        "sectionName": "תהליך החיפוש והמחקר",
        "icon": Search,
        "color": "#0a9396",
        "parameters": [
            {
                "id": "search_difficulty",
                "value1": "מצאתי במהירות מה שחיפשתי",
                "value2": "חיפוש ממושך ומאתגר",
                "midValues": []
            },
            {
                "id": "source_variety",
                "value1": "התבססתי על מקור אחד",
                "value2": "השוויתי בין מקורות רבים",
                "midValues": ["מקור יחיד", "2-3 מקורות", "מספר מקורות", "מגוון רחב"]
            },
            {
                "id": "source_quality",
                "value1": "מקורות פופולריים / ויקיפדיה",
                "value2": "מקורות אקדמיים / מקצועיים",
                "midValues": ["פופולרי", "מעורב", "אמין", "אקדמי"]
            }
        ]
    },
    {
        "sectionName": "שימוש בבינה מלאכותית",
        "icon": Sparkles,
        "color": "#94d2bd",
        "parameters": [
            {
                "id": "ai_contribution",
                "value1": "AI כתב את רוב התוכן",
                "value2": "כתבתי הכל בעצמי",
                "midValues": ["AI מלא", "עזרה רבה", "עזרה חלקית", "עצמאי"]
            },
            {
                "id": "ai_usage_type",
                "value1": "העתקתי תשובות ישירות",
                "value2": "השתמשתי ב-AI כמקור השראה",
                "midValues": ["העתקה", "עריכה קלה", "עיבוד", "השראה"]
            }
        ]
    },
    {
        "sectionName": "למידה והבנה",
        "icon": Brain,
        "color": "#31572c",
        "parameters": [
            {
                "id": "new_knowledge",
                "value1": "לא למדתי משהו חדש",
                "value2": "למדתי דברים חדשים ומרתקים",
                "midValues": ["ידוע", "מעט חדש", "מעניין", "מרתק"]
            },
            {
                "id": "understanding_depth",
                "value1": "הבנה שטחית של הנושא",
                "value2": "הבנה עמוקה של הנושא",
                "midValues": ["שטחי", "בסיסי", "טוב", "עמוק"]
            },
            {
                "id": "perspective_change",
                "value1": "לא שיניתי דעה / תפיסה",
                "value2": "המחקר שינה את דעתי",
                "midValues": []
            }
        ]
    },
    {
        "sectionName": "כישורי מחקר",
        "icon": Microscope,
        "color": "#4f772d",
        "parameters": [
            {
                "id": "research_skills_development",
                "value1": "לא פיתחתי כלים חדשים",
                "value2": "רכשתי שיטות מחקר חדשות",
                "midValues": ["ללא שינוי", "מעט", "למדתי", "התפתחתי"]
            },
            {
                "id": "search_tools",
                "value1": "חיפוש בסיסי בגוגל",
                "value2": "שימוש במאגרים ומנועים מתקדמים",
                "midValues": ["גוגל בלבד", "מנועים בסיסיים", "מגוון כלים", "מתקדם"]
            },
            {
                "id": "source_evaluation",
                "value1": "לא למדתי לזהות מקורות אמינים",
                "value2": "שיפרתי יכולת הערכת מקורות",
                "midValues": []
            }
        ]
    },
    {
        "sectionName": "מוטיבציה והתמדה",
        "icon": Heart,
        "color": "#ee9b00",
        "parameters": [
            {
                "id": "effort_level",
                "value1": "עשיתי מינימום נדרש",
                "value2": "השקעתי מעבר לנדרש",
                "midValues": ["מינימום", "נדרש", "השקעה", "מעבר"]
            },
            {
                "id": "timing",
                "value1": "דחיתי עד הרגע האחרון",
                "value2": "עבדתי בהתלהבות מההתחלה",
                "midValues": []
            },
            {
                "id": "enjoyment",
                "value1": "התהליך היה משעמם",
                "value2": "התהליך היה מהנה",
                "midValues": ["משעמם", "אוקיי", "מעניין", "מהנה"]
            }
        ]
    },
    {
        "sectionName": "ערך אישי",
        "icon": HandCoins,
        "color": "#ca6702",
        "parameters": [
            {
                "id": "personal_value",
                "value1": "עבודה לציון בלבד",
                "value2": "עבודה בעלת משמעות אישית",
                "midValues": ["לציון", "חובה", "ערך", "משמעותי"]
            },
            {
                "id": "future_interest",
                "value1": "לא אמשיך לחקור את הנושא",
                "value2": "רוצה להמשיך לחקור",
                "midValues": []
            }
        ]
    }
]

export function ResearchReview() {
    const research = useResearchData(state => state.research);
    const currTerm = useTime(state => state.currTerm);

    const [formData, setFormData] = useState(research?.metadata?.review ||
        sections.reduce((acc, section) => ({
            ...acc,
            [section.sectionName]: section.parameters.reduce((acc, param) => ({
                ...acc,
                [param.id]: 50,
            }), {})
        }), { summary: "" })
    );
    const [madeChanges, setMadeChanges] = useState(false);

    useEffect(()=>{
        if (!formData) return;
        researchActions.updateResearch({ metadata: { review: formData } });
    },[formData])

    const handleParameterChange = (sectionName, paramId, value) => {
        setFormData(prev => ({
            ...prev,
            [sectionName]: {
                ...prev[sectionName],
                [paramId]: value
            }
        }));
        setMadeChanges(true);
    };

    const handleSummaryChange = (value) => {
        setFormData(prev => ({ ...prev, summary: value }));
        setMadeChanges(true);
    };

    const handleSave = () => {
        researchActions.updateResearch({ metadata: { review: formData } });
        setMadeChanges(false);
    };

    return (
        <div className="flex flex-col gap-4 p-4 divide-y divide-stone-300/50">
            {sections.map(section => (
                <Box2 key={section.sectionName} label={section.sectionName} LabelIcon={section.icon}>
                    <div className='flex flex-col gap-4 divide-y divide-stone-300/50'>
                        {section.parameters.map(param => (
                            <div key={param.id} className='pr-8 pb-2'>
                                <GooeySlider
                                    min={0}
                                    max={100}
                                    value={formData[section.sectionName][param.id]}
                                    onChange={(value) => handleParameterChange(section.sectionName, param.id, value)}
                                    labelLeft={param.value1}
                                    labelRight={param.value2}
                                    midValues={param.midValues}
                                    color={section.color} />
                            </div>
                        ))}
                    </div>
                </Box2>
            ))}

            <Box2 label="סיכום משותף" LabelIcon={FileText}>
                <textarea
                    value={formData.summary}
                    onChange={(e) => handleSummaryChange(e.target.value)}
                    placeholder=" סיכום כללי של הפרויקט"
                    rows={3}
                    className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
            </Box2>

            <div className="flex justify-center">
                <Button data-role="save" onClick={handleSave} disabled={!madeChanges} className={`px-8 py-2 disabled:opacity-50 ${!madeChanges ? "opacity-50" : ""}`}>
                    <Save className="w-4 h-4" />
                    שמור
                </Button>
            </div>
        </div>
    );
}
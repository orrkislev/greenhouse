'use client';
import { useEffect, useState } from "react";
import { BookOpen, Brain, Clock, FileText, Handshake, Heart, Pencil, Presentation, Save, Shield, Telescope } from "lucide-react";
import Box2 from "@/components/Box2";
import Button from "@/components/Button";
import GooeySlider from "@/components/GooeySlider";

const { useProjectData, projectActions } = require("@/utils/store/useProject");
const { useTime } = require("@/utils/store/useTime");

const sections = [
    {
        "sectionName": "אופי הפרויקט",
        "icon": Brain,
        "color": "#005f73",
        "parameters": [
            {
                "id": "project_type",
                "value1": "ניסוי / אקספלורציה",
                "value2": "פרויקט מקצועי ומלוטש",
                "midValues": ["התנסות", "חובבני", "מעמיק", "מקצועי"]
            },
            {
                "id": "focus",
                "value1": "התמקדות בתהליך",
                "value2": "התמקדות בתוצאה",
                "midValues": []
            },
            {
                "id": "connection_type",
                "value1": "נבחר כאתגר אינטלקטואלי",
                "value2": "חיבור רגשי / אישי עמוק",
                "midValues": []
            }
        ]
    },
    {
        "sectionName": "הגדרת יעדים",
        "icon": Telescope,
        "color": "#0a9396",
        "parameters": [
            {
                "id": "goal_clarity",
                "value1": "התגבש תוך כדי תנועה",
                "value2": "יעד מוגדר וברור מראש",
                "midValues": ["אלתור", "כיוון כללי", "יעד ברור", "תוכנית מפורטת"]
            }
        ]
    },
    {
        "sectionName": "תכנון",
        "icon": Pencil,
        "color": "#94d2bd",
        "parameters": [
            {
                "id": "planning_scope",
                "value1": "ראיית מאקרו (חזון)",
                "value2": "ירידה לפרטים ודקויות",
                "midValues": []
            },
            {
                "id": "planning_approach",
                "value1": "אינטואיטיבי (תחושת בטן)",
                "value2": "שיטתי / מבוסס מחקר",
                "midValues": ["אינטואיציה", "היברידי", "מתודי", "מחקרי"]
            }
        ]
    },
    {
        "sectionName": "ניהול זמן",
        "icon": Clock,
        "color": "#31572c",
        "parameters": [
            {
                "id": "time_management",
                "value1": "ספרינטים ברגע האחרון",
                "value2": "עבודה עקבית ומדודה",
                "midValues": ["קראנצ'", "בגלים", "קבוע למדי", "משמעתי"]
            }
        ]
    },
    {
        "sectionName": "מוטיבציה",
        "icon": Heart,
        "color": "#ee9b00",
        "parameters": [
            {
                "id": "motivation_source",
                "value1": "משמעת עצמית (צריך לעשות)",
                "value2": "תשוקה והנאה (רוצה לעשות)",
                "midValues": ["חובה", "משמעת", "עניין", "תשוקה"]
            },
            {
                "id": "reward_type",
                "value1": "תגמול חיצוני (ציון/פידבק)",
                "value2": "סיפוק פנימי וסקרנות",
                "midValues": []
            }
        ]
    },
    {
        "sectionName": "התמודדות עם אתגרים",
        "icon": Shield,
        "color": "#ca6702",
        "parameters": [
            {
                "id": "problem_solving",
                "value1": "פתרון עצמאי (\"ראש בקיר\")",
                "value2": "התייעצות ושיתוף פעולה",
                "midValues": ["לבד", "נקודתי", "שיתופי", "צוותי"]
            },
            {
                "id": "obstacle_response",
                "value1": "עקיפת המכשול / שינוי כיוון",
                "value2": "התעקשות על הפתרון המקורי",
                "midValues": ["פיבוט", "גמיש", "עקבי", "מתמיד"]
            }
        ]
    },
    {
        "sectionName": "ליווי והנחייה",
        "icon": Handshake,
        "color": "#bb3e03",
        "parameters": [
            {
                "id": "mentorship",
                "value1": "עבודה עצמאית לחלוטין",
                "value2": "עבודה עם מנטור/מורה באופן קבוע",
                "midValues": ["עצמאי", "נקודות ייעוץ", "ליווי חלקי", "הנחיה קבועה"]
            }
        ]
    },
    {
        "sectionName": "למידה וביצוע",
        "icon": BookOpen,
        "color": "#ae2012",
        "parameters": [
            {
                "id": "learning_style",
                "value1": "למידה תוך כדי ניסוי (Hands-on)",
                "value2": "למידה תיאורטית מעמיקה",
                "midValues": ["ניסוי וטעייה", "מעשי", "מאוזן", "תיאורטי"]
            },
            {
                "id": "quality_approach",
                "value1": "\"Done is better than perfect\"",
                "value2": "פרפקציוניזם וליטוש",
                "midValues": ["MVP", "פונקציונלי", "מלוטש", "מושלם"]
            }
        ]
    },
    {
        "sectionName": "הצגה ותיעוד",
        "icon": Presentation,
        "color": "#ae2012",
        "parameters": [
            {
                "id": "presentation_effort",
                "value1": "הצגה מינימלית",
                "value2": "הצגה מעוצבת ומפורטת",
                "midValues": ["בסיסי", "פשוט", "מעוצב", "מקצועי"]
            },
            {
                "id": "documentation_type",
                "value1": "תיעוד התהליך והקשיים",
                "value2": "הצגת התוצר המוגמר בלבד",
                "midValues": []
            }
        ]
    }
]

export function ProjectReview() {
    const project = useProjectData(state => state.project);

    const [formData, setFormData] = useState(project?.metadata?.review ||
        sections.reduce((acc, section) => ({
            ...acc,
            [section.sectionName]: section.parameters.reduce((acc, param) => ({
                ...acc,
                [param.id]: 50,
            }), {})
        }), { summary: "" })
    );

    const [madeChanges, setMadeChanges] = useState(false);

    useEffect(() => {
        if (!formData) return;
        projectActions.updateMetadata({ review: formData });
    }, [formData])

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
        projectActions.updateMetadata({ review: formData });
        setMadeChanges(false);
    };

    return (
        <div className="flex flex-col gap-4 p-4 divide-y divide-stone-300/50 mb-16">
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
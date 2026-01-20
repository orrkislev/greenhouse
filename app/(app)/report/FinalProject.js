'use client';

import { useEffect, useState, useMemo } from "react";
import { BookOpen, Brain, Circle, CircleOff, ChevronDown, ChevronUp, Heart, Lightbulb, Microscope, Pencil, Presentation, Target, TrendingUp, Zap, Hammer, ChartLine, Compass, Wrench, Briefcase, Globe, ArrowRight } from "lucide-react";
import Button, { IconButton } from "@/components/Button";
import GooeySlider from "@/components/GooeySlider";
import SmartText from "@/components/SmartText";
import { motion, AnimatePresence } from "motion/react";
import RadarChart from "@/components/RadarChart";
import { useUser } from "@/utils/store/useUser";
import Box2 from "@/components/Box2";
import { ALLOW_STUDENT_EDIT } from './page';

const { useProjectData } = require("@/utils/store/useProject");

const sections = [
    {
      sectionName: "תמונת פרויקט",
      icon: Compass,
      color: "#001219",
      parameters: [
        {
          id: "project_clarity",
          value1: "רעיון פתוח",
          value2: "פרויקט מגובש",
          midValues: ["סקיצה", "כיוון", "מבנה", "חזון"]
        },
        {
          id: "plan_vs_do",
          value1: "יותר תכנון",
          value2: "יותר עשייה",
          midValues: ["רעיוני", "ניסיוני", "מאוזן", "מיושם"]
        },
        {
          id: "project_control",
          value1: "גדול עליי",
          value2: "בשליטה",
          midValues: ["מבלבל", "מאתגר", "בר־שליטה", "ביטחון"]
        }
      ]
    },
    {
      sectionName: "תוצר במגמה",
      icon: Wrench,
      color: "#005f73",
      withOverview: true,
      parameters: [
        {
          id: "professional_level",
          value1: "התנסות בסיסית",
          value2: "רמה מקצועית",
          midValues: ["מתחיל", "מתפתח", "מתקדם", "מקצועי"]
        },
        {
          id: "product_focus",
          value1: "התפזרות",
          value2: "מיקוד",
          midValues: ["חיפוש", "כיוונים", "ממוקד", "חד"]
        },
        {
          id: "process_vs_result",
          value1: "תהליך",
          value2: "תוצר",
          midValues: []
        },
        {
          id: "professional_challenge",
          value1: "אזור נוחות",
          value2: "אתגר משמעותי",
          midValues: ["בטוח", "קצת מאתגר", "מאתגר", "קצה היכולת"]
        }
      ]
    },
    {
      sectionName: "חקר",
      icon: Microscope,
      color: "#0a9396",
      withOverview: true,
      parameters: [
        {
          id: "research_question",
          value1: "שאלה כללית",
          value2: "שאלה חדה",
          midValues: ["כללית", "ממוקדת", "מורכבת", "עמוקה"]
        },
        {
          id: "research_connection",
          value1: "מנותק",
          value2: "מזין תוצר",
          midValues: ["מקביל", "משיק", "משולב", "מניע"]
        },
        {
          id: "research_depth",
          value1: "איסוף מידע",
          value2: "עמדה אישית",
          midValues: ["איסוף", "הבנה", "ניתוח", "עמדה"]
        },
        {
          id: "knowledge_confidence",
          value1: "חוסר ביטחון",
          value2: "בקיאות",
          midValues: []
        }
      ]
    },
    {
      sectionName: "מודל עסקי",
      icon: Briefcase,
      color: "#94d2bd",
      withOverview: true,
      parameters: [
        {
          id: "need_clarity",
          value1: "רעיון כללי",
          value2: "צורך ברור",
          midValues: ["רעיון", "כיוון", "צורך", "בעיה חדה"]
        },
        {
          id: "target_audience",
          value1: "קהל רחב",
          value2: "קהל ממוקד",
          midValues: ["כללי", "משוער", "מוגדר", "מדויק"]
        },
        {
          id: "market_connection",
          value1: "תיאורטי",
          value2: "מחובר לשוק",
          midValues: ["רעיוני", "סביר", "מציאותי", "מבוסס"]
        },
        {
          id: "entrepreneurial_interest",
          value1: "כי צריך",
          value2: "מעניין אותי",
          midValues: []
        }
      ]
    },
    {
      sectionName: "אימפקט",
      icon: Globe,
      color: "#ee9b00",
      withOverview: true,
      parameters: [
        {
          id: "impact_scope",
          value1: "אישי",
          value2: "השפעה רחבה",
          midValues: ["אישי", "קרוב", "קהילתי", "רחב"]
        },
        {
          id: "impact_centrality",
          value1: "שולי",
          value2: "מרכזי",
          midValues: ["משני", "קיים", "משמעותי", "מניע"]
        },
        {
          id: "impact_realism",
          value1: "הצהרתי",
          value2: "קונקרטי",
          midValues: ["סיסמה", "כוונה", "פעולה", "שינוי"]
        }
      ]
    },
    {
      sectionName: "מבט קדימה",
      icon: ArrowRight,
      color: "#ca6702",
      parameters: [
        {
          id: "next_steps_clarity",
          value1: "הרבה חוסר",
          value2: "כיוון ברור",
          midValues: ["ערפל", "שאלות", "בהירות", "מפת דרך"]
        },
        {
          id: "energy_forward",
          value1: "שחיקה",
          value2: "דרייב",
          midValues: ["עייף", "מתנדנד", "מוטיבציה", "התלהבות"]
        }
      ]
    }
  ]
  

export default function FinalProject({ finalProject, onSave }) {
    const originalUser = useUser(state => state.originalUser);
    const project = useProjectData(state => state.project);

    const [formData, setFormData] = useState(finalProject ||
        sections.reduce((acc, section) => ({
            ...acc,
            [section.sectionName]: section.parameters.reduce((acc, param) => ({
                ...acc,
                [param.id]: 50,
            }))
        }), {
            reflections_project: "",
            reflections_research: "",
            next_steps: "",
            radar: [
                { subject: 'הצבת יעדים', value: 50 },
                { subject: 'תכנון', value: 50 },
                { subject: 'למידה', value: 50 },
                { subject: 'ביצוע', value: 50 },
                { subject: 'הצגה', value: 50 },
            ]
        })
    );
    const [madeChanges, setMadeChanges] = useState(false);
    const [showSliders, setShowSliders] = useState(false);

    useEffect(() => {
        if (finalProject) {
            setFormData(finalProject);
            // Check if sliders are mostly filled (more than 50% are not 50)
            const allValues = sections.flatMap(section =>
                section.parameters.map(param => finalProject[section.sectionName]?.[param.id])
            ).filter(v => v !== undefined);
            const nonDefaultValues = allValues.filter(v => v !== 50);
            const shouldHideSliders = allValues.length > 0 && (nonDefaultValues.length / allValues.length) > 0.5;
            setShowSliders(!shouldHideSliders);
        }
    }, [finalProject]);

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

    const handleTextChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setMadeChanges(true);
    };

    const handleSave = () => {
        onSave(formData);
        setMadeChanges(false);
    };

    const handleRadarChange = (radarData) => {
        setFormData(prev => ({ ...prev, radar: radarData }));
        setMadeChanges(true);
    };

    const canEdit = ALLOW_STUDENT_EDIT || !!originalUser;

    return (
        <>
            {canEdit && showSliders && (
                <div className="flex flex-col gap-4 p-4 divide-y divide-stone-300/50 mb-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold">רפלקציה</h3>
                        <button
                            onClick={() => setShowSliders(false)}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            <span>הסתר</span>
                            <ChevronUp className="w-4 h-4" />
                        </button>
                    </div>
                    {sections.map(section => (
                        <Box2 key={section.sectionName} label={section.sectionName} LabelIcon={section.icon}>
                            <div className='flex flex-col gap-4 divide-y divide-stone-300/50'>
                                {section.parameters.map(param => (
                                    <div key={param.id} className={`flex gap-2 pr-8 pb-2 ${formData[section.sectionName][param.id] >= 0 ? '' : 'opacity-50'}`}>
                                        <div>
                                            {formData[section.sectionName][param.id] != undefined ? (
                                                <IconButton icon={Circle} onClick={() => handleParameterChange(section.sectionName, param.id, undefined)} />
                                            ) : (
                                                <IconButton icon={CircleOff} onClick={() => handleParameterChange(section.sectionName, param.id, 50)} />
                                            )}
                                        </div>
                                        <GooeySlider
                                            min={0}
                                            max={100}
                                            value={formData[section.sectionName][param.id] || 50}
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
                </div>
            )}

            {canEdit && !showSliders && (
                <div className="flex justify-center mb-4">
                    <button
                        onClick={() => setShowSliders(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-200 rounded-lg transition-colors border border-border"
                    >
                        <span>רפלקציה</span>
                        <ChevronDown className="w-4 h-4" />
                    </button>
                </div>
            )}

            <div className='mt-4 border-2 border-black bg-white rounded-lg flex overflow-hidden'>
                <div className='bg-black p-1 flex items-center justify-center'>
                    <div className='text-white rotate-90 text-2xl font-bold'>
                        פרויקט גמר
                    </div>
                </div>
                <div className="flex-1 flex flex-col gap-8">
                    <div className="flex-1 flex gap-4">
                        <div className="flex-1 p-4 flex flex-col gap-2">
                            <div className="text-sm text-muted-foreground">פרויקט הגמר</div>
                            <SmartText
                                text={project?.title}
                                onEdit={(newText) => {
                                    // TODO: Update project title in project store
                                }}
                                editable={false}
                                className="text-xl font-bold"
                                placeholder="ללא כותרת"
                            />
                            <div className="text-sm text-muted-foreground mb-4">
                                בליווי <SmartText
                                    text={project?.master?.first_name}
                                    onEdit={(newText) => {
                                        // TODO: Update master name in project store
                                    }}
                                    editable={false}
                                    withIcon={false}
                                    className="text-sm text-muted-foreground inline"
                                    placeholder="ללא מנטור"
                                />
                            </div>
                            <SmartText
                                text={formData?.reflections_project}
                                onEdit={(newText) => handleTextChange('reflections_project', newText)}
                                editable={canEdit}
                                withIcon={true}
                                className="text-sm italic"
                                placeholder="סיכום תהליך הפרויקט"
                            />
                        </div>
                        <div className="flex-1 flex items-center justify-center mt-8">
                            <RadarChart data={formData?.radar || []} size={200} onEdit={canEdit ? handleRadarChange : undefined} />
                        </div>
                    </div>

                    <div className="flex-1 flex gap-4">
                        <div className="flex-1 p-4 flex flex-col gap-2">
                            <div className="text-sm text-muted-foreground">החקר</div>
                            <SmartText
                                text={formData?.reflections_research}
                                onEdit={(newText) => handleTextChange('reflections_research', newText)}
                                editable={canEdit}
                                withIcon={true}
                                className="text-sm italic"
                                placeholder="סיכום תהליך החקר"
                            />
                        </div>
                    </div>

                    <div className="flex-1 p-4 bg-gray-50 flex flex-col gap-2 mb-8">
                        <div className="text-sm font-semibold">צעדים הבאים</div>
                        <SmartText
                            text={formData?.next_steps}
                            onEdit={(newText) => handleTextChange('next_steps', newText)}
                            editable={canEdit}
                            withIcon={true}
                            className="text-sm italic text-muted-foreground"
                            placeholder="יעדים להמשך הפרויקט"
                        />
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {canEdit && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{
                            opacity: madeChanges ? 1 : 0.5,
                            y: madeChanges ? 0 : -10,
                            scale: madeChanges ? 1 : 0.95
                        }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                            duration: 0.3
                        }}
                        className="mt-4 flex justify-center"
                    >
                        <Button
                            data-role="save"
                            onClick={handleSave}
                            disabled={!madeChanges}
                            className={madeChanges ? "shadow-lg" : ""}
                        >
                            שמירה
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

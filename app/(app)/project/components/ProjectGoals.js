import { useEffect, useRef, useState } from "react";
import { Blend, BookOpen, Pencil, Telescope, X } from "lucide-react";
import { projectActions, useProjectData } from "@/utils/store/useProject";
import SmartTextArea from "@/components/SmartTextArea";
import { AnimatePresence, motion, stagger } from "motion/react";


const goalIcons = [
    <Telescope key="telescope" className="w-4 h-4" />,
    <BookOpen key="book" className="w-4 h-4" />,
    <Blend key="blend" className="w-4 h-4" />,
]
const InitialGoals = [
    {
        title: "מה התוצר של הפרויקט שלי",
        description: "תיאור מפורט של התוצר של הפרויקט",
        leadingQuestions: [
            "מה אני מתכוון לעשות בפרויקט?",
            "למי נועד התוצר הזה?",
            "מה הוא אמור לעשות או לעורר?",
        ],
    },
    {
        title: "מה אני רוצה ללמוד תוך כדי",
        description: "תיאור מפורט של מה אני רוצה ללמוד תוך כדי",
        leadingQuestions: [
            "איזה מיומנויות ארכוש בעבודה על הפרויקט?",
            "באיזה כלים וטכנולוגיות אשתמש?",
            "באיזה תחומי ידע הפרויקט הזה נוגע",
        ],
    },
    {
        title: "מה חשוב לפתח כלומד עצמאי",
        description: "תיאור מפורט של מה אני רוצה לפתח כלומד עצמאי",
        leadingQuestions: [
            "לארגן את הזמן שלי טוב יותר?",
            "להתמודד עם קשיים?",
            "להעיז יותר?",
        ],
    },
]

export default function ProjectGoals() {

    return (
        <div className="flex flex-col md:flex-row gap-3">
            <FocusedGoal index={0} />
            <FocusedGoal index={1} />
            <FocusedGoal index={2} />
        </div>
    );
}


function FocusedGoal({ index }) {
    const goals = useProjectData(state => state.project.metadata?.goals);
    const [goal, setGoal] = useState(goals?.[index] || InitialGoals[index]);
    const [isFocused, setIsFocused] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        setGoal(goals?.[index] || InitialGoals[index]);
    }, [goals, index]);

    const closeAndSave = () => {
        setIsFocused(false);
        const newGoals = useProjectData.getState().project.metadata.goals || InitialGoals;
        newGoals[index] = goal;
        projectActions.updateMetadata({ goals: newGoals });
    }

    const updateContent = (key, value) => {
        setGoal(prev => ({ ...prev, [key]: value }));
    }
    const updateQuestion = (index, value) => {
        setGoal(prev => ({ ...prev, leadingQuestions: prev.leadingQuestions.map((question, i) => i === index ? value : question) }));
    }
    const newQuestion = () => {
        setGoal(prev => ({ ...prev, leadingQuestions: [...prev.leadingQuestions, ""] }));
    }
    const removeQuestion = (index) => {
        setGoal(prev => ({ ...prev, leadingQuestions: prev.leadingQuestions.filter((_, i) => i !== index) }));
    }

    const boundingBox = ref.current?.getBoundingClientRect() || { top: 0, left: 0, width: 0 };
    const boxStyle = {
        position: 'absolute',
        top: boundingBox.top,
        left: boundingBox.left,
        width: boundingBox.width,
    }

    return (
        <>
            <div ref={ref} className="rounded-lg flex gap-2 p-2 bg-white border border-border flex-1 group relative hover:bg-accent transition-all duration-200 cursor-pointer" onClick={() => setIsFocused(true)}>
                <div className="p-1">{goalIcons[index]}</div>
                <div className="flex-1 flex flex-col gap-1">
                    <div className="text-muted-foreground text-sm whitespace-pre-wrap leading-relaxed">{goal.title}</div>
                    <div className="text-muted-foreground text-xs whitespace-pre-wrap leading-relaxed">{goal.description}</div>
                </div>

                {/* <button className="absolute opacity-0 group-hover:opacity-50 hover:opacity-100 transition-opacity cursor-pointer left-2 top-2"
                    onClick={() => setIsFocused(true)}>
                    <Pencil className="w-4 h-4" />
                </button> */}
            </div>
            <AnimatePresence>
                {isFocused && ref.current && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="fixed top-0 left-0 w-full h-full bg-black/30 backdrop-blur-xs z-10" onClick={closeAndSave}>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            style={boxStyle} className="rounded-lg flex gap-2 p-2 border border-border gap-2 flex-1 bg-white pointer-events-auto"
                            onClick={e => e.stopPropagation()}>

                            <div className="p-1">{goalIcons[index]}</div>
                            <div className="flex-1 flex flex-col gap-2">
                                <div className="text-foreground text-sm">
                                    <SmartTextArea value={goal.title} onChange={e => updateContent("title", e.target.value)} />
                                </div>
                                <div className="w-full h-px bg-stone-300" />
                                <div className="text-muted-foreground text-sm">
                                    <SmartTextArea value={goal.description} onChange={e => updateContent("description", e.target.value)} />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{
                                // start from the last child; stagger 0.15s between them
                                staggerChildren: 0.15,
                                staggerDirection: -1,
                                delayChildren: 0.2, // optional
                            }}
                            className="absolute flex flex-col gap-2 max-w-64"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                top: `${boundingBox.top}px`,
                                left: `${boundingBox.left - 10}px`,
                                transform: "translateX(-100%)",
                            }}
                        >
                            {goal.leadingQuestions.map((question, index) => (
                                <motion.div
                                    key={`${question}-${index}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.2, ease: "easeOut", delay: index * 0.1 }}
                                    className="px-4 py-1 bg-white border border-border flex gap-2 group w-full text-xs"
                                >
                                    <SmartTextArea
                                        value={question}
                                        onChange={(e) => updateQuestion(index, e.target.value)}
                                    />
                                    <button
                                        onClick={() => removeQuestion(index)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer "
                                    >
                                        <X className="w-4 h-4 text-destructive" />
                                    </button>
                                </motion.div>
                            ))}

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2, ease: "easeOut", delay: (goal.leadingQuestions.length + 1) * 0.1 }}
                                className="text-center text-white font-semibold hover:bg-white hover:text-black transition-colors"
                            >
                                <button onClick={newQuestion}>+</button>
                            </motion.div>
                        </motion.div>

                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
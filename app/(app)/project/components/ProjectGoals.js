import { useEffect, useRef, useState } from "react";
import { Blend, BookOpen, Pencil, Telescope, X } from "lucide-react";
import { projectActions, useProject } from "@/utils/store/useProject";


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

    useEffect(() => {
        projectActions.loadGoals();
    }, []);

    return (
        <div className="flex gap-3">
            <FocusedGoal index={0} />
            <FocusedGoal index={1} />
            <FocusedGoal index={2} />
        </div>
    );
}


function FocusedGoal({ index }) {
    const goals = useProject(state => state.goals);
    const [goal, setGoal] = useState(goals["goal" + index] || InitialGoals[index]);
    const [isFocused, setIsFocused] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        setGoal(goals["goal" + index] || InitialGoals[index]);
    }, [goals, index]);

    const closeAndSave = () => {
        setIsFocused(false);
        projectActions.saveGoal("goal" + index, goal);
    }

    const updateContent = (key, value) => {
        setGoal(prev => ({ ...prev, [key]: value }));
    }
    const updateQuestion = (index, value) => {
        setGoal(prev => ({ ...prev, leadingQuestions: prev.leadingQuestions.map((question, i) => i === index ? value : question) }));
    }
    const newQuestion = () => {
        console.log("newQuestion");
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
            <div ref={ref} className="flex gap-2 p-2 border border-stone-300 flex-1 group relative">
                <div className="p-1">{goalIcons[index]}</div>
                <div className="flex-1 flex flex-col gap-1">
                    <div className="text-stone-600 text-sm whitespace-pre-wrap leading-relaxed">{goal.title}</div>
                    <div className="text-stone-500 text-xs whitespace-pre-wrap leading-relaxed">{goal.description}</div>
                </div>

                <button className="absolute opacity-0 group-hover:opacity-50 hover:opacity-100 transition-opacity cursor-pointer left-2 top-2"
                    onClick={() => setIsFocused(true)}>
                    <Pencil className="w-4 h-4" />
                </button>
            </div>
            {isFocused && ref.current && (
                <div className="absolute top-0 left-0 w-full h-full bg-black/30 backdrop-blur-xs z-10" onClick={closeAndSave}>
                    <div style={boxStyle} className="flex gap-2 p-2 border border-stone-300 gap-2 flex-1 bg-white pointer-events-auto"
                        onClick={e => e.stopPropagation()}>

                        <div className="p-1">{goalIcons[index]}</div>
                        <div className="flex-1 flex flex-col gap-2">
                            <div className="text-stone-700 text-sm">
                                <AutoSizeTextarea type="text"
                                    autoFocus={true}
                                    value={goal.title}
                                    onFinish={value => updateContent("title", value)}
                                />
                            </div>
                            <div className="w-full h-px bg-stone-300" />
                            <div className="text-stone-500 text-sm">
                                <AutoSizeTextarea
                                    value={goal.description}
                                    onFinish={value => updateContent("description", value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="absolute flex flex-col gap-2 max-w-64" onClick={e => e.stopPropagation()}
                        style={{
                            top: boundingBox.top + 'px',
                            left: boundingBox.left - 10 + 'px',
                            transform: 'translateX(-100%)',
                        }}
                    >
                        {goal.leadingQuestions.map((question, index) => (
                            <div key={question} className="px-4 py-1 bg-white border border-stone-300 flex gap-2 group w-full text-xs">
                                <AutoSizeTextarea
                                    value={question}
                                    onFinish={value => updateQuestion(index, value)}
                                />
                                <button onClick={() => removeQuestion(index)} className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ">
                                    <X className="w-4 h-4 text-red-500" />
                                </button>
                            </div>
                        ))}

                        <div className="text-center text-white font-semibold hover:bg-white hover:text-black transition-colors">
                            <button onClick={newQuestion}>+</button>
                        </div>

                    </div>
                </div>
            )}
        </>
    )
}

export function AutoSizeTextarea({ value, onFinish, autoFocus }) {
    const ref = useRef(null);

    useEffect(() => {
        if (ref.current) {
            ref.current.style.height = 'auto';
            ref.current.style.height = ref.current.scrollHeight + 'px';
        }
    }, [value]);

    const onChange = (e) => {
        if (ref.current) {
            ref.current.style.height = 'auto';
            ref.current.style.height = ref.current.scrollHeight + 'px';
        }
    }

    return (
        <textarea ref={ref}
            defaultValue={value}
            autoFocus={autoFocus}
            onBlur={(e) => onFinish(e.target.value)}
            className="w-full h-auto resize-none whitespace-pre-wrap leading-loose"
            onChange={onChange}
        />
    )
}
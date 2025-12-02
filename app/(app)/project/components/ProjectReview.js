'use client';
import { useState } from "react";
import WithLabel from "@/components/WithLabel";
import { Loader, MessageSquare } from "lucide-react";
import Box2 from "@/components/Box2";
import { useUser } from "@/utils/store/useUser";
import Button from "@/components/Button";

const { useProjectData, projectActions } = require("@/utils/store/useProject");
const { useTime } = require("@/utils/store/useTime");

const STATUS_OPTIONS = ["לא בוצע", "בוצע חלקית", "בוצע", "בוצע מעולה"];

const PARAMETERS = [
    { id: "goals", label: "מטרות", description: "הגדרת יעדים ומטרות לפרויקט" },
    { id: "presentation", label: "הצגה", description: "אופן הצגת הדברים והעמידה מול קהל" },
    { id: "planning", label: "תכנון", description: "בניית לוח זמנים וארגון המשימות" },
    { id: "showcase", label: "תערוכה", description: "הנראות הויזואלית והאסתטיקה" },
    { id: "execution", label: "ביצוע", description: "איכות התוצר הסופי והגימור" },
];

export function ProjectReview() {
    const project = useProjectData(state => state.project);
    const currTerm = useTime(state => state.currTerm);

    const [formData, setFormData] = useState(project.metadata?.review ||
        PARAMETERS.reduce((acc, param) => ({
            ...acc,
            [param.id]: { student: "", staff: "", note: "" }
        }), { summary: "" })
    );
    const [madeChanges, setMadeChanges] = useState(false);

    if (project.terms?.some(term => term.id === currTerm.id)) return null;

    const handleParameterChange = (paramId, value) => {
        console.log(paramId, value);
        setFormData(prev => ({
            ...prev,
            [paramId]: value
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
        <Box2 label="משוב" LabelIcon={Loader}>
            <div className="flex flex-col gap-4 p-4">
                <div className="border border-stone-300 rounded overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-stone-200 border-b border-stone-300">
                                <th />
                                <th className="text-right text-xs font-semibold py-2">חניכ.ה</th>
                                <th className="text-right text-xs font-semibold">מנחה</th>
                                <th className="text-right text-xs font-semibold">הערות</th>
                            </tr>
                        </thead>
                        <tbody>
                            {PARAMETERS.map(param => (
                                <ParameterInput key={param.id} value={formData[param.id]} onChange={val => handleParameterChange(param.id, val)} parameter={param} />
                            ))}
                        </tbody>
                    </table>
                </div>

                <WithLabel label="סיכום משותף" className="w-full">
                    <textarea
                        value={formData.summary}
                        onChange={(e) => handleSummaryChange(e.target.value)}
                        placeholder=" סיכום כללי של הפרויקט"
                        rows={3}
                        className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                </WithLabel>

                <div>
                    <Button data-role="save" onClick={handleSave} disabled={!madeChanges} className={`disabled:opacity-50 ${!madeChanges ? "opacity-50" : ""}`}>
                        שמור
                    </Button>
                </div>
            </div>
        </Box2>
    );
}


function ParameterInput({ parameter, value, onChange }) {
    const originalUser = useUser((state) => state.originalUser)

    const handleChange = (type, val) => {
        const newValue = { ...value };
        newValue[type] = val;
        onChange(newValue);
    }

    return (
        <tr className="border-b border-stone-200/80">
            <td className='flex flex-col p-2'>
                <div className="text-xs font-semibold">{parameter.label}</div>
                <span className="text-xs text-muted-foreground">{parameter.description}</span>
            </td>
            <td>
                <select

                    value={value.student}
                    onChange={(e) => handleChange("student", e.target.value)}
                    className="border border-border rounded-sm text-sm focus:outline-none"
                >
                    <option value="">בחר</option>
                    {STATUS_OPTIONS.map(option => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
            </td>
            <td>
                <select
                    disabled={!originalUser}
                    value={value.staff}
                    onChange={(e) => handleChange("staff", e.target.value)}
                    className={`border border-border rounded-sm text-sm focus:outline-none ${!originalUser ? "opacity-50" : ""}`}
                >
                    <option value="">בחר</option>
                    {STATUS_OPTIONS.map(option => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
            </td>
            <td>
                <input
                    disabled={!originalUser}
                    type="text"
                    value={value.note}
                    onChange={(e) => handleChange("note", e.target.value)}
                    placeholder="הערה קצרה"
                    className="flex-1 text-xs bg-white border-none"
                />
            </td>
        </tr>
    );
}
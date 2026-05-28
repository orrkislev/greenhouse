import { useEffect, useState } from "react";
import { ganttActions, useGantt } from "@/utils/store/useGantt";
import { Plus, Save, Trash2 } from "lucide-react";

const daysOfWeek = ['א', 'ב', 'ג', 'ד', 'ה'];

export default function AdminStudyGroups() {
    const studyGroups = useGantt(state => state.studyGroups);
    const [data, setData] = useState([]);
    const [dirty, setDirty] = useState(false);

    useEffect(() => {
        ganttActions.loadStudyGroups();
    }, []);

    useEffect(() => {
        if (studyGroups) setData(studyGroups);
    }, [studyGroups]);

    const update = (index, key, value) => {
        setData(prev => prev.map((g, i) => i === index ? { ...g, [key]: value } : g));
        setDirty(true);
    };

    const addGroup = () => {
        setData(prev => [...prev, { title: 'שעה : שם קבוצה', content: 'מיקום', day: '0' }]);
        setDirty(true);
    };

    const removeGroup = (index) => {
        setData(prev => prev.filter((_, i) => i !== index));
        setDirty(true);
    };

    const save = async () => {
        await ganttActions.saveStudyGroups(data);
        setDirty(false);
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">קבוצות למידה</h2>
                <button
                    onClick={save}
                    disabled={!dirty}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <Save className="w-4 h-4" />
                    שמור
                </button>
            </div>

            <table className="w-full text-sm border-collapse">
                <thead>
                    <tr className="border-b text-muted-foreground text-right">
                        <th className="py-2 pr-2 font-medium w-24">יום</th>
                        <th className="py-2 pr-2 font-medium">כותרת (כולל שעה)</th>
                        <th className="py-2 pr-2 font-medium">מיקום / פרטים</th>
                        <th className="py-2 w-10" />
                    </tr>
                </thead>
                <tbody>
                    {data.map((group, index) => (
                        <tr key={index} className="border-b hover:bg-muted/30">
                            <td className="py-1.5 pr-2">
                                <select
                                    value={group.day}
                                    onChange={e => update(index, 'day', e.target.value)}
                                    className="border border-border rounded px-1 py-0.5 bg-background text-sm w-full"
                                >
                                    {daysOfWeek.map((d, i) => (
                                        <option key={i} value={String(i)}>יום {d}</option>
                                    ))}
                                </select>
                            </td>
                            <td className="py-1.5 pr-2">
                                <input
                                    type="text"
                                    value={group.title}
                                    onChange={e => update(index, 'title', e.target.value)}
                                    className="border border-border rounded px-2 py-0.5 bg-background text-sm w-full"
                                    placeholder="9:00 : שם קבוצה"
                                />
                            </td>
                            <td className="py-1.5 pr-2">
                                <input
                                    type="text"
                                    value={group.content}
                                    onChange={e => update(index, 'content', e.target.value)}
                                    className="border border-border rounded px-2 py-0.5 bg-background text-sm w-full"
                                    placeholder="מיקום"
                                />
                            </td>
                            <td className="py-1.5 text-center">
                                <button
                                    onClick={() => removeGroup(index)}
                                    className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <button
                onClick={addGroup}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors self-start"
            >
                <Plus className="w-4 h-4" />
                הוסף קבוצה
            </button>
        </div>
    );
}

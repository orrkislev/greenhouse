import { isAdmin, useUser } from "@/utils/store/useUser"
import AuthGoogleCalendar from "./Google/AuthGoogleCalendar";
import { ganttActions, useGantt } from "@/utils/store/useGantt";
import { useEffect, useState } from "react";
import { Pencil, Plus, Save, Trash2 } from "lucide-react";

export default function ScheduleContext() {
    const user = useUser(state => state.user);

    return (
        <div className="flex flex-col gap-4">
            {!user.googleRefreshToken && <AuthGoogleCalendar />}
            <StudyGroupsMessage />
        </div>
    )
}

const daysOfWeek = ['א', 'ב', 'ג', 'ד', 'ה'];

function StudyGroupsMessage() {
    const user = useUser(state => state.user);
    const studyGroups = useGantt(state => state.studyGroups);
    const [editMode, setEditMode] = useState(false);
    const [data, setData] = useState([]);

    useEffect(()=>{
        ganttActions.loadStudyGroups();
    },[]);

    useEffect(() => {
        if (studyGroups) setData(studyGroups);
    }, [studyGroups]);

    const days = Object.fromEntries([[0, []], [1, []], [2, []], [3, []], [4, []]]);
    data.forEach((group, index) => {
        days[group.day].push({ group, index });
    });

    const removeGroup = (index) => { setData(data.filter((_, i) => i !== index)); }
    const addGroup = () => { setData([...data, { title: 'שעה : שם קבוצה', content: 'פרטים נוספים', day: 4 }]) }
    const editGroupTitle = (index, title) => { setData(data.map((group, i) => i === index ? { ...group, title } : group)); }
    const editGroupContent = (index, content) => { setData(data.map((group, i) => i === index ? { ...group, content } : group)); }
    const editGroupDay = (index, day) => { setData(data.map((group, i) => i === index ? { ...group, day } : group)); }

    const clickEditSave = () => {
        if (editMode) {
            setEditMode(false);
            ganttActions.saveStudyGroups(data);
        } else {
            setEditMode(true);
        }
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold">קבוצות למידה</h3>
                {isAdmin() && (
                    <button className="text-sm text-muted-foreground text-xs flex items-center gap-1 rounded-full p-1 cursor-pointer hover:bg-accent" onClick={clickEditSave}>
                        {editMode ? <Save className="w-6 h-6 text-green-800" /> : <Pencil className="w-4 h-4" />}
                    </button>
                )}
            </div>
            <div className="flex flex-col">
                {daysOfWeek.map((day, dayIndex) => (
                    <div key={dayIndex}>
                        <h3 className="font-semibold">יום {day}</h3>
                        {days[dayIndex].map(({ group, index }) => (
                            <div key={index} className="py-2">
                                {editMode ? (
                                    <div className="flex flex-col gap-1 border border-border rounded-md p-2">
                                        <input name="title" type="text" value={group.title} onChange={(e) => editGroupTitle(index, e.target.value)} className="font-semibold" />
                                        <input name="content" type="text" value={group.content} onChange={(e) => editGroupContent(index, e.target.value)} className="text-sm text-muted-foreground" />
                                        <div className="flex justify-between">
                                            <select name="day" value={group.day} onChange={(e) => editGroupDay(index, e.target.value)}>
                                                {daysOfWeek.map((day, dayIndex) => (
                                                    <option key={dayIndex} value={dayIndex}>יום {day}</option>
                                                ))}
                                            </select>
                                            <button className="text-sm text-muted-foreground rounded-full p-1 cursor-pointer hover:bg-accent text-red-700" onClick={() => removeGroup(index)}>
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="text-sm text-muted-foreground font-semibold">{group.title}</div>
                                        <div className="text-xs text-muted-foreground">{group.content}</div>
                                    </>
                                )}
                            </div>
                        ))}
                        {dayIndex < daysOfWeek.length - 1 && <div className="h-px w-full bg-gray-300" />}
                    </div>
                ))}
            </div>
            {editMode && (
                <button className="text-muted-foreground p-1 rounded-full cursor-pointer hover:bg-accent flex justify-center items-center" onClick={addGroup}>
                    <Plus className="w-4 h-4" />
                </button>
            )}
        </div>
    )
}
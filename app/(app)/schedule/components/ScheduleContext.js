import { useUser } from "@/utils/store/useUser"
import AuthGoogleCalendar from "./Google/AuthGoogleCalendar";
import { ganttActions, useGantt } from "@/utils/store/useGantt";
import { useEffect, useState } from "react";
import { Check, Pencil, Plus, Save, Trash2 } from "lucide-react";
import TimeRangePicker from "@/components/ui/timerange-picker";

export default function ScheduleContext() {
    const user = useUser(state => state.user);

    return (
        <div className="flex flex-col gap-4">
            {user.googleRefreshToken && <AuthGoogleCalendar />}
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

    useEffect(() => {
        if (studyGroups) setData(studyGroups);
    }, [studyGroups]);

    useEffect(() => {
        ganttActions.loadSchoolMessage();
    }, []);

    const canEdit = user.roles.includes('admin');

    console.log({ data, studyGroups });
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
                {canEdit && (
                    <button className="text-sm text-gray-500 text-xs flex items-center gap-1 rounded-full p-1 cursor-pointer hover:bg-gray-200" onClick={clickEditSave}>
                        {editMode ? <Save className="w-6 h-6 text-green-800" /> : <Pencil className="w-4 h-4" />}
                    </button>
                )}
            </div>
            <div className="flex flex-col divide-y divide-gray-300">
                {daysOfWeek.map((day, dayIndex) => (
                    <div key={dayIndex}>
                        <h3 className="font-semibold">יום {day}</h3>
                        {days[dayIndex].map(({ group, index }) => (
                            <div key={index}>
                                {editMode ? (
                                    <div className="flex flex-col gap-1 border border-gray-300 rounded-md p-2">
                                        <input name="title" type="text" value={group.title} onChange={(e) => editGroupTitle(index, e.target.value)} className="font-semibold" />
                                        <input name="content" type="text" value={group.content} onChange={(e) => editGroupContent(index, e.target.value)} className="text-sm text-gray-500" />
                                        <div className="flex justify-between">
                                            <select name="day" value={group.day} onChange={(e) => editGroupDay(index, e.target.value)}>
                                                {daysOfWeek.map((day, dayIndex) => (
                                                    <option key={dayIndex} value={dayIndex}>יום {day}</option>
                                                ))}
                                            </select>
                                            <button className="text-sm text-gray-500 rounded-full p-1 cursor-pointer hover:bg-gray-200 text-red-700" onClick={() => removeGroup(index)}>
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="text-sm text-gray-500 font-semibold">{group.title}</div>
                                        <div className="text-sm text-gray-500">{group.content}</div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            {editMode && (
                <button className="text-gray-500 p-1 rounded-full cursor-pointer hover:bg-gray-200 flex justify-center items-center" onClick={addGroup}>
                    <Plus className="w-4 h-4" />
                </button>
            )}
        </div>
    )
}
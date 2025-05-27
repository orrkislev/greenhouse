import { useUserSchedule } from "@/utils/store/scheduleDataStore";
import { DatePicker } from "../ui/DatePicker";
import { formatDate, parseDate } from "@/utils/utils";
import { useUser } from "@/utils/store/user";
import { collection, doc, updateDoc } from "firebase/firestore";
import { db } from "@/utils/firebase/firebase";
import { HOURS } from "@/utils/store/scheduleDataStore";
import { DateRange } from "../ui/DateRange";

export default function EditSelected() {
    const selected = useUserSchedule(state => state.selected);
    const setSelected = useUserSchedule(state => state.setSelected);
    const events = useUserSchedule(state => state.events);
    const tasks = useUserSchedule(state => state.tasks);

    if (!selected) return null

    const selectedEvent = events.find(event => event.id === selected);
    if (selectedEvent) return <EventEdit event={selectedEvent} />;

    const selectedTask = tasks.find(task => task.id === selected);
    if (selectedTask) return <TaskEdit task={selectedTask} />;

}


function TaskEdit({task}) {
    const user = useUser(state => state.user);
    const saveChanges = (updatedData) => {
        const tasksCol = collection(db, "users", user.id, "tasks");
        const taskDoc = doc(tasksCol, task.id);
        updateDoc(taskDoc, updatedData)
    }

    const handleDateChange = (date) => {
        saveChanges({ start: formatDate(date.start), end: formatDate(date.end) });
    }

    return (
        <div className="p-4">
            <h2 className="text-lg font-semibold">Edit Selected Task</h2>
            <p className="text-gray-600">{task.title}</p>
            <DateRange onChange={handleDateChange} start={parseDate(task.start)} end={parseDate(task.end)} />
        </div>
    );
}


function EventEdit({event}) {
    const user = useUser(state => state.user);

    const saveChanges = (updatedData) => {
        const eventsCol = collection(db, "users", user.id, "events");
        const eventDoc = doc(eventsCol, event.id);
        updateDoc(eventDoc, updatedData)
    }

    const handleDateChange = (date) => {
        saveChanges({ date: formatDate(date) });
    }

    return (
        <div className="p-4">
            <h2 className="text-lg font-semibold">Edit Selected Event</h2>
            <p className="text-gray-600">{event.title}</p>
            <DatePicker initial={parseDate(event.date)} onChange={handleDateChange} />
            <div className="mt-4 flex gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                    <select
                        value={event.start || ""}
                        className="border rounded px-2 py-1"
                        onChange={e => saveChanges({ start: e.target.value })}
                    >
                        <option value="">בחר שעה</option>
                        {Object.values(HOURS).map(hour => (
                            <option key={hour.label} value={hour.label}>{hour.label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                    <select
                        value={event.end || ""}
                        className="border rounded px-2 py-1"
                        onChange={e => saveChanges({ end: e.target.value })}
                    >
                        <option value="">בחר שעה</option>
                        {Object.values(HOURS).map(hour => (
                            <option key={hour.label} value={hour.label}>{hour.label}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}
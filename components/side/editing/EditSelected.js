import { useUserSchedule } from "@/utils/store/scheduleDataStore";
import EventEdit from "./EventEdit";
import TaskEdit from "./TaskEdit";

export default function EditSelected() {
    const selected = useUserSchedule(state => state.selected);
    const events = useUserSchedule(state => state.events);
    const tasks = useUserSchedule(state => state.tasks);

    if (!selected) return null

    const selectedEvent = events.find(event => event.id === selected);
    if (selectedEvent) return <EventEdit event={selectedEvent} />;

    const selectedTask = tasks.find(task => task.id === selected);
    if (selectedTask) return <TaskEdit task={selectedTask} />;

}


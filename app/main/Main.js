import { eventsActions, useEvents } from "@/utils/useEvents";
import { ganttActions } from "@/utils/useGantt";
import { groupsActions, useGroups } from "@/utils/useGroups";
import { meetingsActions, useMeetings } from "@/utils/useMeetings";
import { tasksActions, useTasks } from "@/utils/useTasks";
import { useEffect } from "react";




export default function MainPage() {
    const meetings = useMeetings((state) => state.meetings);
    const events = useEvents((state) => state.events);
    const tasks = useTasks((state) => state.tasks);
    const groups = useGroups((state) => state.groups);


    useEffect(() => {
        eventsActions.loadTodayEvents();
        tasksActions.loadTodayTasks();
        meetingsActions.loadTodayMeetings();
        groupsActions.loadTodayEntries();
        ganttActions.loadTodayGantt();
    }, []);


    return (
        <div>
            <h1>Today Meetings</h1>
            {meetings.map(meeting => (
                <div key={meeting.id}>
                    <h3>{meeting.title}</h3>
                    <p>{meeting.start} - {meeting.end}</p>
                    <p>Participants: {meeting.participants.join(', ')}</p>
                </div>
            ))}

            <h1>Today Events</h1>
            {events.map(event => (
                <div key={event.id}>
                    <h3>{event.title}</h3>
                    <p>{event.start} - {event.end}</p>
                </div>
            ))}

            <h1>Today Tasks</h1>
            {tasks.map(task => (
                <div key={task.id}>
                    <h3>{task.title}</h3>
                    <p>Due: {task.dueDate}</p>
                    <p>Status: {task.status}</p>
                </div>
            ))}

            <h1>Today Group Entries</h1>
            {groups.map(group => (
                <div key={group.id}>
                    <h3>{group.name}</h3>
                    {group.entries && group.entries.map(entry => (
                        <div key={entry.id}>
                            <p>{entry.type} - {entry.title}</p>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}
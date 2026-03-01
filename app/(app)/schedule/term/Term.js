import { useTime } from "@/utils/store/useTime"
import { addDays, addWeeks, differenceInWeeks, endOfWeek, isSameDay, isToday, startOfWeek, subDays, format } from "date-fns";
import { eventsActions, useEventsData, eventSelectors } from "@/utils/store/useEvents";
import { useEffect, useMemo, useState } from "react";
import usePopper from "@/components/Popper";
import { EventEditModal, EventDetailModal } from "../components/EventModal";
import { useUser } from "@/utils/store/useUser";
import { useGroups } from "@/utils/store/useGroups";
import { useProjectData, projectUtils } from "@/utils/store/useProject";
import { ganttActions, useGantt } from "@/utils/store/useGantt";
import TaskModal from "@/components/TaskModal";
import Menu, { MenuItem, MenuList } from "@/components/Menu";
import { ClipboardPlus, Plus } from "lucide-react";

// Color palette for groups
const GROUP_COLORS = [
    { bg: 'bg-blue-500', hover: 'hover:bg-blue-700' },
    { bg: 'bg-purple-500', hover: 'hover:bg-purple-700' },
    { bg: 'bg-pink-500', hover: 'hover:bg-pink-700' },
    { bg: 'bg-orange-500', hover: 'hover:bg-orange-700' },
    { bg: 'bg-teal-500', hover: 'hover:bg-teal-700' },
    { bg: 'bg-indigo-500', hover: 'hover:bg-indigo-700' },
    { bg: 'bg-rose-500', hover: 'hover:bg-rose-700' },
    { bg: 'bg-cyan-500', hover: 'hover:bg-cyan-700' },
];

const MEETING_COLORS = { bg: 'bg-green-600', hover: 'hover:bg-green-700' };

function getGroupColor(groupId) {
    if (!groupId) return GROUP_COLORS[0];
    const hash = groupId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return GROUP_COLORS[hash % GROUP_COLORS.length];
}

export default function Term() {
    const events = useEventsData(state => state.events);
    const currTerm = useTime((state) => state.currTerm);
    const projectTasks = useProjectData(state => state.tasks);
    const gantt = useGantt(state => state.gantt);

    useEffect(() => {
        useProjectData.getState().loadTasks();
    }, [])

    useEffect(() => {
        if (!currTerm) return;
        eventsActions.loadTermEvents();
        ganttActions.fetchGanttEvents(new Date(currTerm.start), new Date(currTerm.end));
    }, [currTerm])

    if (!currTerm) return null;

    const termStart = new Date(currTerm.start);
    const termEnd = new Date(currTerm.end);

    const startDate = startOfWeek(termStart);
    const endDate = endOfWeek(termEnd);

    const numWeeks = differenceInWeeks(endDate, startDate) + 1;
    const weeks = Array.from({ length: numWeeks }, (_, i) => {
        const startWeek = startOfWeek(addWeeks(startDate, i));
        const week = [];

        // Days Sunday (0) through Thursday (4)
        for (let j = 0; j < 5; j++) {
            const date = addDays(startWeek, j);
            week.push({
                date: new Date(date),
                inTerm: date >= termStart && date <= termEnd,
                isWeekend: false,
                isToday: isToday(date),
                isFirstDayOfTerm: isSameDay(date, termStart),
                isLastDayOfTerm: isSameDay(date, termEnd),
                inPast: date < subDays(new Date(), 1),
            });
        }

        // Weekend (Friday-Saturday combined)
        const friday = addDays(startWeek, 5);
        const saturday = addDays(startWeek, 6);
        week.push({
            date: new Date(friday),
            endDate: new Date(saturday),
            inTerm: (friday >= termStart && friday <= termEnd) || (saturday >= termStart && saturday <= termEnd),
            isWeekend: true,
            isToday: isToday(friday) || isToday(saturday),
            isFirstDayOfTerm: isSameDay(friday, termStart) || isSameDay(saturday, termStart),
            isLastDayOfTerm: isSameDay(friday, termEnd) || isSameDay(saturday, termEnd),
            inPast: saturday < subDays(new Date(), 1),
        });

        return week;
    });

    const dayHeaders = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'סופ״ש'];

    const cellEvents = useMemo(() => {
        const result = {};
        weeks.forEach((week, weekIndex) => {
            week.forEach((day, dayIndex) => {
                const key = `${weekIndex}-${dayIndex}`;
                if (day.isWeekend) {
                    const fridayGantt = gantt.get(format(day.date, 'yyyy-MM-dd')) || [];
                    const saturdayGantt = gantt.get(format(day.endDate, 'yyyy-MM-dd')) || [];
                    const allGantt = [...fridayGantt, ...saturdayGantt].filter(
                        (e, i, arr) => arr.findIndex(x => x.summary === e.summary) === i
                    );
                    result[key] = {
                        events: events.filter(event => event.date == day.date || event.date == day.endDate ||
                            event.day_of_the_week === 6 ||
                            event.day_of_the_week === 7
                        ),
                        tasks: projectTasks.filter(task => isSameDay(new Date(task.due_date), day.date) || isSameDay(new Date(task.due_date), day.endDate)),
                        ganttEvents: allGantt,
                    };
                } else {
                    result[key] = {
                        events: events.filter(event => event.date && isSameDay(new Date(event.date), day.date) ||
                            event.day_of_the_week === dayIndex + 1
                        ),
                        tasks: projectTasks.filter(task => isSameDay(new Date(task.due_date), day.date)),
                        ganttEvents: gantt.get(format(day.date, 'yyyy-MM-dd')) || [],
                    }
                }
            });
        });
        return result;
    }, [events, weeks, projectTasks, gantt]);

    return (
        <div className="w-full overflow-auto p-4">
            <table className="w-full border-collapse table-fixed">
                <thead>
                    <tr>
                        {dayHeaders.map((day, i) => (
                            <th key={i} className="border border-gray-300 p-2 bg-gray-100 text-sm font-semibold w-1/6">
                                {day}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {weeks.map((week, weekIndex) => (
                        <tr key={weekIndex}>
                            {week.map((day, dayIndex) => {
                                const key = `${weekIndex}-${dayIndex}`;
                                return (
                                    <Cell
                                        key={key}
                                        day={day}
                                        events={cellEvents[key]?.events || []}
                                        tasks={cellEvents[key]?.tasks || []}
                                        ganttEvents={cellEvents[key]?.ganttEvents || []}
                                    />
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

function Cell({ day, events, tasks, ganttEvents }) {
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

    const bgClass = day.isToday ? 'bg-stone-200 hover:bg-stone-300' :
        day.inPast ? 'bg-gray-50 stripes' :
            day.isWeekend ? 'bg-blue-50' :
                !day.inTerm ? 'bg-gray-100' : '';

    return (
        <td className={`relative border border-slate-300 w-1/6 min-h-32 align-top p-2 hover:bg-stone-100 group/cell ${bgClass}`}>
            <div className="text-xs text-gray-600 font-semibold mb-2">
                {day.isWeekend ? (
                    <>
                        {format(day.date, 'd/M')} - {format(day.endDate, 'd/M')}
                    </>
                ) : (
                    format(day.date, 'd/M')
                )}
            </div>

            {day.isFirstDayOfTerm && (
                <div className="text-xs text-green-600 font-semibold mb-1">התחלת תקופה</div>
            )}
            {day.isLastDayOfTerm && (
                <div className="text-xs text-red-600 font-semibold mb-1">סיום תקופה</div>
            )}

            <div className="flex flex-col gap-1 w-full">
                {ganttEvents.filter(e => e.isAllDay).map((e, i) => (
                    <div key={i} className="text-[11px] text-gray-400 truncate">{e.summary}</div>
                ))}
                {ganttEvents.filter(e => !e.isAllDay).map((e, i) => (
                    <div key={i} className="text-[11px] text-gray-400 truncate">
                        <span className="ml-1">{e.time}</span>{e.summary}
                    </div>
                ))}
                {tasks.map((task) => (
                    <Task key={task.id} task={task} />
                ))}

                {events.map((event) => (
                    <Event key={event.id} event={event} />
                ))}

                <NewEventButton date={day.date} />
                <Menu small className="absolute left-2 top-2 bg-white opacity-0 group-hover/cell:opacity-100 scale-80 transition-all duration-300" icon={Plus}>
                    <MenuList>
                        <MenuItem title="משימה חדשה בפרויקט" icon={ClipboardPlus} onClick={() => setIsTaskModalOpen(true)} />
                    </MenuList>
                </Menu>
            </div>

            <TaskModal
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                context={projectUtils.getContext()}
                defaultDueDate={format(day.date, 'yyyy-MM-dd')}
            />
        </td>
    )
}

function Task({ task }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <div className="bg-white rounded p-1 text-xs relative cursor-pointer hover:bg-stone-100" onClick={() => setIsModalOpen(true)}>
                {task.title}
                <div className={`absolute left-0 top-[-4px] text-[10px] px-1 rounded-sm bg-white`}>
                    פרויקט
                </div>
            </div>
            <TaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                task={task}
                context={task.context}
            />
        </>
    )
}

function Event({ event }) {
    const { open, close, Popper } = usePopper();
    const user = useUser(state => state.user);
    const groups = useGroups(state => state.groups);
    const isMeeting = event.day_of_the_week !== null;
    const isOwner = user?.id && event?.created_by === user.id;

    const timeString = event.start ?
        event.start.split(':')[0].padStart(2, '0') + ':' + event.start.split(':')[1].padStart(2, '0') :
        '';

    // Get group info
    const group = event.group_id ? groups.find(g => g.id === event.group_id) : null;
    const colors = isMeeting ? MEETING_COLORS : getGroupColor(event.group_id);

    const handleClick = (e) => {
        e.stopPropagation();
        open();
    };

    return (
        <>
            <div
                className={`relative ${colors.bg} ${colors.hover} group/event cursor-pointer text-white rounded p-1 text-xs flex gap-2`}
                onClick={handleClick}
            >
                {group && (
                    <div className={`absolute left-0 top-[-4px] text-[10px] px-1 ${colors.bg} rounded-sm`}>
                        {group.name}
                    </div>
                )}
                <div className="shrink-0">{timeString}</div>
                <div className="break-words overflow-hidden">
                    {event.summary || event.title || 'אירוע'}
                    {isMeeting && event.participants?.length > 0 && " עם " + event.participants.map(participant => participant.first_name).join(', ')}
                </div>
            </div>
            <Popper>
                {isOwner ? (
                    <EventEditModal close={close} event={event} />
                ) : (
                    <EventDetailModal close={close} event={event} />
                )}
            </Popper>
        </>
    )
}

function NewEventButton({ date }) {
    const { open, close, Popper } = usePopper();

    const handleClick = (e) => {
        e.stopPropagation();
        open();
    };

    return (
        <>
            <div
                className="flex-[3] opacity-0 group-hover/cell:opacity-100 bg-green-500 rounded-full text-xs flex justify-center items-center hover:bg-green-800 text-white cursor-pointer group/add-button h-4"
                onClick={handleClick}
            >
                <div className="group-hover/add-button:rotate-180 duration-300 font-bold text-md">+</div>
            </div>
            <Popper>
                <EventEditModal close={close} _date={date} _time="09:00" />
            </Popper>
        </>
    )
}

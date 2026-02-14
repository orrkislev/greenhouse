import usePopper from "@/components/Popper";
import { useWeekEvents, eventSelectors, useGroupWeekEvents } from "@/utils/store/useEvents";
import { useTime } from "@/utils/store/useTime";
import { addHours, format } from "date-fns";
import { EventEditModal, EventDetailModal } from "./EventModal";
import { useMemo } from "react";
import { useUser } from "@/utils/store/useUser";
import { useGroups } from "@/utils/store/useGroups";
import { ArrowLeft, ArrowRight } from "lucide-react";

function stringToTime(timeStr) {
    let time = new Date();
    if (timeStr === 'ערב') {
        time.setHours(13, 30, 0, 0);
    } else {
        const [hours, minutes] = timeStr.split(':').map(Number);
        time.setHours(hours, minutes, 0, 0);
    }
    return time;
}

// Check if eventTimeStr is within the hour of timeSlotStr
function isInTimeSlot(timeSlotStr, eventTimeStr) {
    const timeSlotTime = stringToTime(timeSlotStr);
    let nextHour = new Date(timeSlotTime)
    if (timeSlotStr === 'ערב') nextHour.setHours(23, 59, 0, 0);
    else nextHour = addHours(nextHour, 1);
    const eventTime = stringToTime(eventTimeStr);
    return eventTime >= timeSlotTime && eventTime < nextHour;
}

export default function Schedule() {
    const allEvents = useWeekEvents();
    useGroupWeekEvents();
    const week = useTime().week;
    const { nextWeek, prevWeek } = useTime();

    if (!week || week.length === 0) return null;
    if (!allEvents) return null;

    const currentDayOfWeek = (new Date()).getDay();
    const times = ['8:30', '9:30', '10:30', '11:30', '12:30', 'ערב'];
    const days = ['א', 'ב', 'ג', 'ד', 'ה', 'סופ״ש'];

    // Memoize cell events grouping
    const cells = useMemo(() => {
        const result = {};
        week.forEach((day, dayIndex) => {
            const dayEvents = eventSelectors.getEventsForDate(allEvents, day);
            const dayRecurring = eventSelectors.getRecurringEventsForDay(allEvents, dayIndex + 1);

            for (const time of times) {
                const cellEvents = [
                    ...dayEvents.filter(event => isInTimeSlot(time, event.start)),
                    ...dayRecurring.filter(event => isInTimeSlot(time, event.start))
                ];
                result[`${day}-${time}`] = cellEvents;
            }
        });
        return result;
    }, [allEvents, week])

    console.log('events for week:', allEvents);

    return (
        <table className="table-fixed border-collapse w-full h-full">
            <thead>
                <tr>
                    {days.map((day, index) => {
                        // For weekend column, show the Saturday date
                        const dateStr = index === 5 ? week[5] : week[index];
                        const date = new Date(dateStr);
                        const formattedDate = format(date, 'd/M');

                        return (
                            <th key={day} className="border border-gray-300 w-1/6 p-2">
                                <div className="flex items-center justify-center gap-2 relative">
                                    {index === 0 && (
                                        <button
                                            onClick={prevWeek}
                                            className="absolute right-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded p-1"
                                            aria-label="Previous week"
                                        >
                                            <ArrowRight />
                                        </button>
                                    )}
                                    <div className="flex flex-col items-center">
                                        <div className="font-bold">{day}</div>
                                        <div className="text-xs text-gray-500 font-normal">{formattedDate}</div>
                                    </div>
                                    {index === 5 && (
                                        <button
                                            onClick={nextWeek}
                                            className="absolute left-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded p-1"
                                            aria-label="Next week"
                                        >
                                            <ArrowLeft />
                                        </button>
                                    )}
                                </div>
                            </th>
                        );
                    })}
                </tr>
            </thead>
            <tbody>
                {times.map((time, tindex) => (
                    <tr>
                        {week.map((day, dindex) => {
                            // Mark today, or mark weekend column if today is Friday (5) or Saturday (6)
                            const isCurrentDay = currentDayOfWeek === dindex ||
                                                (dindex === 5 && (currentDayOfWeek === 5 || currentDayOfWeek === 6));

                            return (
                                <Cell key={`${dindex}-${tindex}`}
                                    time={time}
                                    date={new Date(day)}
                                    events={cells[`${day}-${time}`]}
                                    isToday={isCurrentDay} />
                            );
                        })}
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

function Cell({ date, time, events, isToday }) {
    return (
        <td className={`relative border border-slate-300 w-1/6 h-24 align-top p-2 hover:bg-stone-100 group/cell ${isToday ? 'bg-stone-200 hover:bg-stone-300' : ''}`} >
            <div className='text-xs opacity-50 mb-2'>{time}</div>
            <div className='flex flex-col w-full h-full gap-1'>
                {events.map((event, index) => (
                    <Event key={index} event={event} />
                ))}

                <NewEventButton date={date} time={time} />
            </div>
        </td>
    )
}

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
    // Simple hash function to consistently assign colors
    const hash = groupId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return GROUP_COLORS[hash % GROUP_COLORS.length];
}

function Event({ event }) {
    const { open, close, Popper } = usePopper({
        onOpen: () => console.log('Event modal opened for:', event.title || event.summary),
        onClose: () => console.log('Event modal closed for:', event.title || event.summary)
    });
    const user = useUser(state => state.user);
    const groups = useGroups(state => state.groups);
    const isMeeting = event.day_of_the_week !== null;
    const isOwner = user?.id && event?.created_by === user.id;

    const timeString = event.start.split(':')[0].padStart(2, '0') + ':' + event.start.split(':')[1].padStart(2, '0');

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
                    <div className={`absolute left-0 top-[-4px] text-[10px] px-1 ${colors.bg} rounded-sm group-hover/event:${colors.hover}`}>
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


function NewEventButton({ date, time }) {
    const { open, close, Popper } = usePopper();

    const timeValue = time == 'ערב' ? '16:00' : time.split(':')[0].padStart(2, '0') + ':' + time.split(':')[1];

    const handleClick = (e) => {
        e.stopPropagation();
        open();
    };

    return (
        <>
            <div
                className="opacity-0 group-hover/cell:opacity-100 bg-green-500 rounded-full text-xs flex justify-center items-center hover:bg-green-800 text-white cursor-pointer group/add-button"
                onClick={handleClick}
            >
                <div className="group-hover/add-button:rotate-180 duration-300 font-bold text-md">+</div>
            </div>
            <Popper>
                <EventEditModal close={close} _date={date} _time={timeValue} />
            </Popper>
        </>
    )
}
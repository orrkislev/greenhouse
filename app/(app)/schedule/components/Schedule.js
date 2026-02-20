import usePopper from "@/components/Popper";
import { useWeekEvents, useGroupWeekEvents } from "@/utils/store/useEvents";
import { useTime } from "@/utils/store/useTime";
import { format } from "date-fns";
import { EventEditModal, EventDetailModal } from "./EventModal";
import { useEffect, useMemo, useRef, useState } from "react";
import { useUser } from "@/utils/store/useUser";
import { useGroups } from "@/utils/store/useGroups";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { days, getTimeSlot, getEndTimeSlot, isInTimeSlot, times } from "./utils";

export default function Schedule() {
    const allEvents = useWeekEvents();
    useGroupWeekEvents();
    const week = useTime().week;
    const { nextWeek, prevWeek } = useTime();

    if (!week || week.length === 0) return null;
    if (!allEvents) return null;

    const currentDayOfWeek = (new Date()).getDay();


    // Memoize cell events grouping
    const cells = useMemo(() => {
        const result = {};
        week.forEach((day, dayIndex) => {
            const dayEvents = allEvents.filter(event => event.date === day);
            const dayRecurring = allEvents.filter(event => event.day_of_the_week === dayIndex + 1);
            const allDayEvents = [...dayEvents, ...dayRecurring];

            // Count how many legs pass through each time slot
            const legCounts = {};
            times.forEach(t => legCounts[t] = 0);
            allDayEvents.forEach(event => {
                if (!event.start || !event.end) return;
                const startSlotIndex = times.indexOf(getTimeSlot(event.start));
                const endSlotIndex = times.indexOf(getEndTimeSlot(event.end));
                if (startSlotIndex >= 0 && endSlotIndex > startSlotIndex) {
                    for (let i = startSlotIndex + 1; i <= endSlotIndex; i++) {
                        legCounts[times[i]]++;
                    }
                }
            });

            for (const time of times) {
                const cellEvents = [
                    ...dayEvents.filter(event => isInTimeSlot(time, event.start)),
                    ...dayRecurring.filter(event => isInTimeSlot(time, event.start))
                ];
                result[`${day}-${time}`] = { events: cellEvents, legCount: legCounts[time] };
            }
        });
        return result;
    }, [allEvents, week])

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
                                    events={cells[`${day}-${time}`]?.events}
                                    legCount={cells[`${day}-${time}`]?.legCount || 0}
                                    isToday={isCurrentDay} />
                            );
                        })}
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

function Cell({ date, time, events, isToday, legCount }) {
    return (
        <td id={`${format(date, 'yyyy-MM-dd')}-${time}`}
            className={`relative border border-slate-300 w-1/6 h-24 align-top p-2 group/cell ${isToday ? 'bg-stone-200' : ''}`}
            style={legCount > 0 ? { paddingLeft: `${9 + legCount * 15}px` } : undefined}>
            <div className='text-xs opacity-50 mb-2'>{time}</div>
            <div className='flex flex-col w-full h-full gap-1'>
                {events.map((event, index) => {
                    const precedingLegs = events.slice(0, index).filter(e =>
                        e.start && e.end && times.indexOf(getEndTimeSlot(e.end)) > times.indexOf(getTimeSlot(e.start))
                    ).length;
                    return <Event key={index} event={event} precedingLegs={precedingLegs} />;
                })}

                <NewEventButton date={date} time={time} />
            </div>
        </td>
    )
}

// Color palette for groups
const GROUP_COLORS = [
    { event: 'bg-blue-500 hover:bg-blue-700', groupHover: 'group-hover/event:bg-blue-700' },
    { event: 'bg-purple-500 hover:bg-purple-700', groupHover: 'group-hover/event:bg-purple-700' },
    { event: 'bg-pink-500 hover:bg-pink-700', groupHover: 'group-hover/event:bg-pink-700' },
    { event: 'bg-orange-500 hover:bg-orange-700', groupHover: 'group-hover/event:bg-orange-700' },
    { event: 'bg-teal-500 hover:bg-teal-700', groupHover: 'group-hover/event:bg-teal-700' },
    { event: 'bg-indigo-500 hover:bg-indigo-700', groupHover: 'group-hover/event:bg-indigo-700' },
    { event: 'bg-rose-500 hover:bg-rose-700', groupHover: 'group-hover/event:bg-rose-700' },
    { event: 'bg-cyan-500 hover:bg-cyan-700', groupHover: 'group-hover/event:bg-cyan-700' },
];

const MEETING_COLORS = { event: 'bg-green-600 hover:bg-green-700', groupHover: 'group-hover/event:bg-green-700' };

function getGroupColor(groupId) {
    if (!groupId) return GROUP_COLORS[0];
    // Simple hash function to consistently assign colors
    const hash = groupId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return GROUP_COLORS[hash % GROUP_COLORS.length];
}

function Event({ event, precedingLegs = 0 }) {
    const { open, close, Popper } = usePopper();
    const user = useUser(state => state.user);
    const groups = useGroups(state => state.groups);
    const thisRef = useRef(null);
    const [legLength, setLegLength] = useState(null);
    const isMeeting = event.day_of_the_week !== null;
    const isOwner = user?.id && event?.created_by === user.id;

    useEffect(()=>{
        // if the event ends in a different time slot, get the cell of the end time (using id) nd set the lefEndRef to it
        if (getEndTimeSlot(event.end) !== getTimeSlot(event.start)) {
            const cellId = `${event.date}-${getEndTimeSlot(event.end)}`;
            const cell = document.getElementById(cellId);
            if (thisRef.current && cell) {
                const thisRect = thisRef.current.getBoundingClientRect();
                const cellRect = cell.getBoundingClientRect();
                setLegLength(cellRect.bottom - 30 - thisRect.top);
            }
        }
    },[event])

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
            <div ref={thisRef} onClick={handleClick}
                className={`relative ${colors.event} group/event cursor-pointer text-white rounded p-1 text-xs flex gap-2`}
                style={precedingLegs > 0 ? { marginLeft: `${5 + precedingLegs * 10}px` } : undefined}
            >
                {group && (
                    <div className={`absolute left-0 top-[-4px] text-[10px] px-1 rounded-sm ${colors.event} ${colors.groupHover}`}>
                        {group.name}
                    </div>
                )}
                <div className="shrink-0">{timeString}</div>
                <div className="break-words overflow-hidden">
                    {event.summary || event.title || 'אירוע'}
                    {isMeeting && event.participants?.length > 0 && " עם " + event.participants.map(participant => participant.first_name).join(', ')}
                </div>
                {legLength && (
                    <div className={`absolute left-0 top-[80%] rounded w-3 h-full ${colors.event} ${colors.groupHover}`} style={{ height: legLength }} />
                )}
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
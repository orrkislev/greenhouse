import usePopper from "@/components/Popper";
import { useWeekEvents, eventSelectors } from "@/utils/store/useEvents";
import { useTime } from "@/utils/store/useTime";
import { addHours } from "date-fns";
import { EventEditModal, EventDetailModal } from "./EventModal";
import { useMemo } from "react";
import { useUser } from "@/utils/store/useUser";

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
    const week = useTime().week;

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
                    {days.map((day) => (
                        <th key={day} className="border border-gray-300 w-1/6 p-2">{day}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {times.map((time, tindex) => (
                    <tr>
                        {week.map((day, dindex) => (
                            <Cell key={`${dindex}-${tindex}`} 
                                time={time}
                                date={new Date(day)}
                                events={cells[`${day}-${time}`]} 
                                isToday={currentDayOfWeek === dindex} />
                        ))}
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

                {/* {events && events.map((event, index) => (
                    <div key={index} className="bg-blue-500 text-white rounded p-1 text-xs overflow-hidden text-ellipsis whitespace-nowrap">
                        {event.summary || event.title || 'אירוע'}
                    </div>
                ))} */}
                {events.map((event, index) => (
                    <Event key={index} event={event} />
                ))}

                <NewEventButton date={date} time={time} />
            </div>
        </td>
    )
}

function Event({ event }) {
    const { open, close, Popper } = usePopper();
    const user = useUser(state => state.user);
    const isMeeting = event.day_of_the_week !== null;
    const isOwner = user?.id && event?.created_by === user.id;

    const timeString = event.start.split(':')[0].padStart(2, '0') + ':' + event.start.split(':')[1].padStart(2, '0');

    return (
        <>
        <div className={`bg-blue-500 hover:bg-blue-700 cursor-pointer text-white rounded p-1 text-xs overflow-hidden text-ellipsis whitespace-nowrap flex gap-2 ${isMeeting ? 'bg-green-600 hover:bg-green-700' : ''}`}
            onClick={open}
        >
            <span>{timeString}</span>
            <span>{event.summary || event.title || 'אירוע'}</span>
            {isMeeting && event.participants?.length > 0 && <span>עם {event.participants.map(participant => participant.first_name).join(', ')}</span>}
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

    const timeValue = time=='ערב' ? '16:00' : time.split(':')[0].padStart(2, '0') +':' +time.split(':')[1];

    return (
        <>
            <div className="opacity-0 group-hover/cell:opacity-100 bg-green-500 rounded-full text-xs flex justify-center items-center hover:bg-green-800 text-white cursor-pointer group/add-button"
                onClick={open}>
                <div className="group-hover/add-button:rotate-180 duration-300 font-bold text-md">+</div>
            </div>
            <Popper>
                <EventEditModal close={close} _date={date} _time={timeValue} />
            </Popper>
        </>
    )
}
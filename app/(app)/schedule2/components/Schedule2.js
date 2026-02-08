import Button from "@/components/Button";
import usePopper from "@/components/Popper";
import { useWeekEvents, eventsActions } from "@/utils/store/useEvents";
import { useMeetings, meetingsActions } from "@/utils/store/useMeetings";
import { useTime } from "@/utils/store/useTime";
import { addHours, format } from "date-fns";
import { Save, Trash2 } from "lucide-react";
import { useState } from "react";

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
    const meetings = useMeetings();
    const week = useTime().week;

    if (!week || week.length === 0) return null;
    if (!allEvents) return null;

    const currentDayOfWeek = (new Date()).getDay();
    const times = ['8:30', '9:30', '10:30', '11:30', '12:30', 'ערב'];
    const days = ['א', 'ב', 'ג', 'ד', 'ה', 'סופ״ש'];

    const cells = {};
    week.forEach((day, dayIndex) => {
        for (const time of times) {
            let cellEvents = []
            if (allEvents[day]) {
                cellEvents = allEvents[day].filter(event => isInTimeSlot(time, event.start));
            }
            cellEvents = [...cellEvents, ...meetings.filter(m => m.day_of_the_week === dayIndex && isInTimeSlot(time, m.start))];
            cells[`${day}-${time}`] = cellEvents
        }
    })

    console.log({ allEvents, meetings, week });

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
    const isMeeting = event.hasOwnProperty('other_participants');
    const ownEvent = !isMeeting;

    const timeString = event.start.split(':')[0].padStart(2, '0') + ':' + event.start.split(':')[1].padStart(2, '0');

    return (
        <>
        <div className={`bg-blue-500 hover:bg-blue-700 cursor-pointer text-white rounded p-1 text-xs overflow-hidden text-ellipsis whitespace-nowrap flex gap-2 ${isMeeting ? 'bg-green-600 hover:bg-green-700' : ''}`}
            onClick={open}
        >
            <span>{timeString}</span>
            {isMeeting && <span>{event.other_participants.map(participant => participant.first_name).join(', ')}</span>}
            {ownEvent && <span>{event.summary || event.title || 'אירוע'}</span>}
        </div>
        <Popper>
            <EventEditModal close={close} event={event} />
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

function EventEditModal({ event, close, _date, _time}) {
    const isNew = !event;

    // Determine event type
    const isMeeting = event?.hasOwnProperty('other_participants');
    const isRecurring = event?.repeat_weekly === true || isMeeting;

    // State for event type selection (for new events)
    const [eventType, setEventType] = useState(
        isNew ? 'regular' : (isMeeting ? 'meeting' : (isRecurring ? 'recurring' : 'regular'))
    );

    // State for event fields
    const [title, setTitle] = useState(event?.title || event?.summary || '');
    const [date, setDate] = useState(_date || (event?.date ? new Date(event.date) : new Date()));
    const [dayOfWeek, setDayOfWeek] = useState(event?.day_of_the_week || (_date ? _date.getDay() : new Date().getDay()));
    const [startTime, setStartTime] = useState(event?.start || _time || '08:30');
    const [endTime, setEndTime] = useState(event?.end || '09:30');
    const [participants, setParticipants] = useState(event?.other_participants || []);

    const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

    console.log({event, eventType, date, dayOfWeek, startTime, endTime});

    const handleSave = async () => {
        try {
            if (isNew) {
                // Create new event
                if (eventType === 'regular') {
                    await eventsActions.addEvent({
                        title,
                        date: format(date, 'yyyy-MM-dd'),
                        start: startTime,
                        end: endTime,
                    });
                } else if (eventType === 'recurring') {
                    // Create recurring event (not a meeting) by directly calling the store
                    await meetingsActions.loadMeetings(); // This will refresh after creation
                    // For now, we'll create it as a meeting without participants
                    // In the future, we should add a proper createRecurringEvent action
                    console.log('Creating recurring event - needs backend implementation');
                } else if (eventType === 'meeting') {
                    // TODO: Handle meeting creation with participants
                    // This requires selecting participants first
                    console.log('Meeting creation with participants - needs participant selection UI');
                }
            } else {
                // Update existing event
                if (isMeeting || isRecurring) {
                    await meetingsActions.updateMeeting(event.id, {
                        title,
                        day_of_the_week: dayOfWeek,
                        start: startTime,
                        end: endTime,
                    });
                } else {
                    await eventsActions.updateEvent(event.id, {
                        title,
                        date: format(date, 'yyyy-MM-dd'),
                        start: startTime,
                        end: endTime,
                    });
                }
            }
            close();
        } catch (error) {
            console.error('Error saving event:', error);
        }
    };

    const handleDelete = async () => {
        if (!event) return;
        try {
            if (isMeeting || isRecurring) {
                await meetingsActions.deleteMeeting(event.id);
            } else {
                await eventsActions.deleteEvent(event);
            }
            close();
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    };

    return (
        <div className="flex flex-col gap-4 min-w-[400px]">
            <div className="font-bold text-lg mb-2">{isNew ? 'יצירת אירוע חדש' : 'עריכת אירוע'}</div>

            {/* Event Type Selector (only for new events) */}
            {isNew && (
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">סוג אירוע:</label>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setEventType('regular')}
                            className={`flex-1 py-2 px-4 rounded border ${eventType === 'regular' ? 'bg-blue-500 text-white' : 'bg-white border-gray-300'}`}
                        >
                            אירוע רגיל
                        </button>
                        <button
                            onClick={() => setEventType('recurring')}
                            className={`flex-1 py-2 px-4 rounded border ${eventType === 'recurring' ? 'bg-blue-500 text-white' : 'bg-white border-gray-300'}`}
                        >
                            אירוע קבוע
                        </button>
                        <button
                            onClick={() => setEventType('meeting')}
                            className={`flex-1 py-2 px-4 rounded border ${eventType === 'meeting' ? 'bg-blue-500 text-white' : 'bg-white border-gray-300'}`}
                        >
                            פגישה
                        </button>
                    </div>
                </div>
            )}

            {/* Event Title */}
            <div className="flex flex-col gap-2">
                <input
                    type="text"
                    placeholder="תיאור האירוע"
                    className="border border-gray-300 rounded p-2"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>

            {/* Date/Day Selection based on type */}
            {(eventType === 'regular' || (!isNew && !isRecurring)) && (
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">תאריך:</label>
                    <input
                        type="date"
                        className="border border-gray-300 rounded p-2"
                        value={date.toISOString().split('T')[0]}
                        onChange={(e) => setDate(new Date(e.target.value))}
                    />
                </div>
            )}

            {(eventType === 'recurring' || eventType === 'meeting' || (!isNew && isRecurring)) && (
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">יום בשבוע:</label>
                    <select
                        className="border border-gray-300 rounded p-2"
                        value={dayOfWeek}
                        onChange={(e) => setDayOfWeek(parseInt(e.target.value))}
                    >
                        {days.map((day, index) => (
                            <option key={index} value={index}>{day}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Time Selection */}
            <div className="flex gap-2">
                <div className="flex flex-col gap-2 flex-1">
                    <label className="text-sm font-semibold">התחלה:</label>
                    <input
                        type="time"
                        className="border border-gray-300 rounded p-2"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                    />
                </div>
                <div className="flex flex-col gap-2 flex-1">
                    <label className="text-sm font-semibold">סיום:</label>
                    <input
                        type="time"
                        className="border border-gray-300 rounded p-2"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                    />
                </div>
            </div>

            {/* Participants (for meetings) */}
            {(eventType === 'meeting' || (!isNew && isMeeting)) && (
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">משתתפים:</label>
                    <div className="border border-gray-300 rounded p-2 min-h-[40px]">
                        {participants.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {participants.map((participant, index) => (
                                    <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                                        {participant.first_name} {participant.last_name}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <span className="text-gray-400 text-sm">אין משתתפים</span>
                        )}
                    </div>
                    {/* TODO: Add participant search/selection */}
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between gap-2">
                <div>
                    {!isNew && (
                        <Button onClick={handleDelete} variant="danger">
                            <Trash2 className="ml-2 h-4 w-4" /> מחיקה
                        </Button>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button onClick={close} variant="secondary">
                        ביטול
                    </Button>
                    <Button onClick={handleSave}>
                        שמירה <Save className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
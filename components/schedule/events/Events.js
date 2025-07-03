import { formatDate } from "@/utils/utils";
import { HOURS, useUserSchedule } from "@/utils/store/scheduleDataStore";
import { useState } from "react";
import { Event } from "./Event";
import { useWeek } from "@/utils/store/scheduleDisplayStore";
import { tw } from "@/utils/tw";
import EditEventDrawer from "./EditEventDrawer copy";

const TimeRow = tw`bg-[#EDCBBB] col-start-2 col-end-[8] z-1 rounded-l-full ml-[-1em] shadow-md`;
const EmptySlot = tw`bg-white rounded-lg p-2 inset-shadow-[0_2px_4px_rgba(0,0,0,0.1)] text-gray-800 mx-2
    flex items-center justify-center text-sm font-bold
    cursor-pointer opacity-0 hover:opacity-100 transition-opacity
    z-5
`;

const HourTitle = tw`flex justify-end col-1`;
const HourTitleInner = tw`text-white font-semibold bg-[#EDCBBB] rounded-r-full pl-8 pr-4 ml-[-1em] flex items-center justify-end shadow-md`;


const newEventTitles = [
    "משהו חדש",
    "אירוע חדש",
    "ללמוד משהו",
    "לעבוד על משהו",
    "פגישה חשובה",
    "שיחה אישית",
];
export default function Events({ edittable = false }) {
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [draggingId, setDraggingId] = useState(null);
    const [resizingId, setResizingId] = useState(null);

    const week = useWeek(state => state.week);
    const events = useUserSchedule(state => state.events)
    const updateEvent = useUserSchedule(state => state.updateEvent);
    const addEvent = useUserSchedule(state => state.addEvent);

    const positions = Array(6).fill(0).map((_, col) => Array(5).fill(0).map((_, row) => (
        { row: row + 4, col: col + 2 }))).flat();

    const onPlace = pos => {
        if (draggingId === null) return;
        updateEvent(draggingId, {
            date: formatDate(week[pos.col - 2]),
            start: HOURS[pos.row - 4],
        })
    }

    const handleNewEvent = (pos) => {
        const date = week[pos.col - 2];
        const hour = HOURS[pos.row - 4];

        const newEvent = {
            date: formatDate(date),
            start: hour,
            duration: 1,
            title: newEventTitles[Math.floor(Math.random() * newEventTitles.length)],
        };
        addEvent(newEvent);
    }

    const weekEvents = events.filter(event => week.some(date => formatDate(date) === event.date));

    let extrasState
    if (edittable) {
        extrasState = 'new-event'
        if (draggingId !== null) extrasState = 'dragging';
        if (resizingId !== null) extrasState = 'resizing';
    }

    return (
        <>
            <TimeRow className="row-4" />
            <TimeRow className="row-5" />
            <TimeRow className="row-6" />
            <TimeRow className="row-7" />
            <TimeRow className="row-8 bg-[#7D86A6]" />

            <HourTitle className="row-4"><HourTitleInner>9:30</HourTitleInner></HourTitle>
            <HourTitle className="row-5"><HourTitleInner>10:30</HourTitleInner></HourTitle>
            <HourTitle className="row-6"><HourTitleInner>11:30</HourTitleInner></HourTitle>
            <HourTitle className="row-7"><HourTitleInner>12:30</HourTitleInner></HourTitle>
            <HourTitle className="row-8"><HourTitleInner className='bg-[#7D86A6]'>אחרהצ</HourTitleInner></HourTitle>

            {positions.map((pos, index) => (
                <EmptySlot key={index} className={`col-${pos.col} row-${pos.row}`}
                    onClick={() => handleNewEvent(pos)}
                >+</EmptySlot>
            ))}

            {extrasState == 'dragging' &&
                positions.map((pos, index) => (
                    <Droppable key={index} row={pos.row} col={pos.col}
                        onPlace={() => onPlace(pos)}
                    />
                ))
            }

            {extrasState == 'resizing' && (() => {
                const event = events.find(e => e.id === resizingId);
                if (!event) return null;
                const eventCol = week.findIndex(date => formatDate(date) === event.date) + 2;
                if (eventCol === -1) return null;
                return positions
                    .filter(pos => pos.col === eventCol)
                    .map((pos, index) => (
                        <Droppable key={index} row={pos.row} col={pos.col}
                            onPlace={() => {
                                const newDuration = pos.row - 4 - HOURS.indexOf(event.start) + 1;
                                if (newDuration > 0) {
                                    updateEvent(resizingId, { duration: newDuration });
                                }
                            }}
                        />
                    ));
            })()}


            {weekEvents.map((event, index) => (
                <Event key={index}
                    firstHourRow={4}
                    edittable={edittable}
                    event={event}
                    onStartDrag={() => setDraggingId(event.id)}
                    onEndDrag={() => setDraggingId(null)}
                    onStartResize={() => setResizingId(event.id)}
                    onEndResize={() => setResizingId(null)}
                    onSelect={() => setSelectedEvent(event)}
                />
            ))}

            <EditEventDrawer onClose={() => setSelectedEvent(null)} event={selectedEvent} />
        </>
    )
}


function Droppable({ row, col, onPlace }) {
    return (
        <div className={`z-20 col-${col} row-${row}`}
            onMouseEnter={onPlace}
        >
        </div>
    );
}
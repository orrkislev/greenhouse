import { formatDate } from "@/utils/utils";
import { HOURS, useUserSchedule } from "@/app/schedule/utils/useUserSchedule";
import { useState } from "react";
import { Event } from "./Event";
import { useWeek } from "@/app/schedule/utils/useWeek";
import { tw } from "@/utils/tw";
import EditEventDrawer from "./EditEventDrawer copy";
import { ScheduleSection } from "../Layout";

const EmptySlot = tw`min-h-8 z-1
    flex items-center justify-center text-xs
    bg-[#F3C5C599] hover:bg-[#F3C5C5]
    text-transparent hover:text-gray-800
    cursor-pointer transition-all
`;

const TimeSlot = tw.div`flex items-start justify-start text-black/50 text-xs pointer-events-none z-6 p-1`;


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
        { row: row + 1, col: col + 1 }))).flat();

    const onPlace = pos => {
        if (draggingId === null) return;
        updateEvent(draggingId, {
            date: formatDate(week[pos.col - 1]),
            start: HOURS[pos.row - 1],
        })
    }

    const handleNewEvent = (pos) => {
        const date = week[pos.col - 1];
        const hour = HOURS[pos.row - 1];

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
        <ScheduleSection name="לוז">
            {positions.map((pos, index) => (
                <EmptySlot key={index} className={`col-${pos.col} row-${pos.row}`}
                    onClick={() => handleNewEvent(pos)}
                >+</EmptySlot>
            ))}

            {positions.map((pos, index) => (
                <TimeSlot key={index} className={`col-${pos.col} row-${pos.row}`}>
                    {HOURS[pos.row - 1]}
                </TimeSlot>
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
                const eventCol = week.findIndex(date => formatDate(date) === event.date) + 1;
                if (eventCol === -1) return null;
                return positions
                    .filter(pos => pos.col === eventCol)
                    .map((pos, index) => (
                        <Droppable key={index} row={pos.row} col={pos.col}
                            onPlace={() => {
                                const newDuration = pos.row - HOURS.indexOf(event.start);
                                if (newDuration > 0) {
                                    updateEvent(resizingId, { duration: newDuration });
                                }
                            }}
                        />
                    ));
            })()}


            {weekEvents.map((event, index) => (
                <Event key={index}
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
        </ScheduleSection>
    )
}


function Droppable({ row, col, onPlace }) {
    return (
        <div className={`z-20 col-${col} row-${row}`}
            onMouseEnter={onPlace}
        />
    );
}
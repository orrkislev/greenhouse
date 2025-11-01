import { useState } from "react";
import { Event } from "./Event";
import { HOURS, useTime } from "@/utils/store/useTime";
import { tw } from "@/utils/tw";
import { ScheduleSection } from "../Layout";
import { getEventDuration, getTimeWithOffset, prepareEventsForSchedule } from "./useWeeksEvents";
import { eventsActions, useWeekEvents } from "@/utils/store/useEvents";

const EmptySlot = tw`min-h-8 z-1
    flex items-center justify-center text-xs
    bg-[#F3C5C599] hover:bg-[#F3C5C5]
    text-transparent hover:text-stone-800
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
export default function Events() {
    const week = useTime(state => state.week);
    const allEvents = useWeekEvents();

    const [draggingId, setDraggingId] = useState(null);
    const [resizingId, setResizingId] = useState(null);


    if (!week || week.length === 0) return null;
    if (!allEvents) return null;


    const eventsArray = Object.values(allEvents).flat();
    const displayEvents = prepareEventsForSchedule(eventsArray, week, true);
    const positions = Array(6).fill(0).map((_, col) => Array(5).fill(0).map((_, row) => (
        { row: row + 1, col: col + 1 }))).flat();

    const onMove = pos => {
        if (draggingId === null) return;
        const currEvent = eventsArray.find(e => e.id === draggingId);
        const currDuration = getEventDuration(currEvent);
        eventsActions.updateEvent(draggingId, {
            date: week[pos.col - 1],
            start: HOURS[pos.row - 1],
            end: getTimeWithOffset(HOURS[pos.row - 1], currDuration * 60),
        })
    }

    const onResize = (pos, event) => {
        const [h, m] = event.start.split(':').map(Number);
        const index = HOURS.indexOf(`${h}:${m}`);
        const newDuration = pos.row - index;
        if (newDuration > 0) {
            eventsActions.updateEvent(resizingId, {
                end: getTimeWithOffset(event.start, newDuration * 60),
            });
        }
    }

    const handleNewEvent = (pos) => {
        const date = week[pos.col - 1];
        const start = HOURS[pos.row - 1];
        const end = getTimeWithOffset(start, 60);

        const newEvent = {
            date, start, end,
            title: newEventTitles[Math.floor(Math.random() * newEventTitles.length)],
        };
        eventsActions.addEvent(newEvent);
    }

    return (
        <ScheduleSection name="לוז" withLabel={true}>
            {positions.map((pos, index) => {
                return <EmptySlot key={index} className={`col-${pos.col} row-${pos.row}`}
                    onClick={() => handleNewEvent(pos)}
                >+</EmptySlot>
            })}

            {positions.map((pos, index) => (
                <TimeSlot key={index} className={`col-${pos.col} row-${pos.row}`}>
                    {HOURS[pos.row - 1] === '13:30' ? 'ערב' : HOURS[pos.row - 1]}
                </TimeSlot>
            ))}



            {draggingId !== null &&
                positions.map((pos, index) => (
                    <Droppable key={index} row={pos.row} col={pos.col} onPlace={() => onMove(pos)} />
                ))
            }

            {resizingId !== null && (() => {
                const event = displayEvents.find(e => e.id === resizingId);
                if (!event) return null;
                const eventCol = week.findIndex(date => date === event.date) + 1;
                if (eventCol === -1) return null;
                return positions
                    .filter(pos => pos.col === eventCol)
                    .map((pos, index) => (
                        <Droppable key={index} row={pos.row} col={pos.col} onPlace={() => onResize(pos, event)} />
                    ));
            })()}


            {displayEvents.map((event, index) => (
                <Event key={index}
                    edittable={event.edittable}
                    event={event}
                    onStartDrag={() => {
                        if (draggingId === null) setDraggingId(event.id)
                    }}
                    onEndDrag={() => setDraggingId(null)}
                    onStartResize={() => setResizingId(event.id)}
                    onEndResize={() => setResizingId(null)}
                />
            ))}

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
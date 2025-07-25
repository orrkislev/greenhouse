import { useState } from "react";
import { Event } from "./Event";
import { HOURS, useTime } from "@/utils/useTime";
import { tw } from "@/utils/tw";
import { ScheduleSection } from "../Layout";
import useWeeksEvents, { getEventDuration, getTimeWithOffset, prepareEventsForSchedule } from "./useWeeksEvents";
import { eventsActions } from "@/utils/useEvents";

const EmptySlot = tw`min-h-8 z-1
    flex items-center justify-center text-xs
    bg-[#F3C5C599] hover:bg-[#F3C5C5]
    text-transparent hover:text-gray-800
    cursor-pointer transition-all
`;
const Empty = tw`min-h-8 z-1 bg-[#F3C5C599]`

const TimeSlot = tw.div`flex items-start justify-start text-black/50 text-xs pointer-events-none z-6 p-1`;


const newEventTitles = [
    "משהו חדש",
    "אירוע חדש",
    "ללמוד משהו",
    "לעבוד על משהו",
    "פגישה חשובה",
    "שיחה אישית",
];
export function ScheduleEvents({ withLabel = true }) {
    const week = useTime(state => state.week);
    const allEvents = useWeeksEvents(week, true);
    if (!week || week.length === 0) return null;


    return (
        <Events events={allEvents} edittable={true} week={week} withLabel={withLabel} />
    )
}
export default function Events({ events, edittable = false, week, withLabel = true }) {
    const [draggingId, setDraggingId] = useState(null);
    const [resizingId, setResizingId] = useState(null);

    const displayEvents = prepareEventsForSchedule(events, week, edittable);

    const positions = Array(6).fill(0).map((_, col) => Array(5).fill(0).map((_, row) => (
        { row: row + 1, col: col + 1 }))).flat();

    const onMove = pos => {
        if (draggingId === null) return;
        const currEvent = events.find(e => e.id === draggingId);
        const currDuration = getEventDuration(currEvent);
        eventsActions.updateEvent(draggingId, {
            date: week[pos.col - 1],
            start: HOURS[pos.row - 1],
            end: getTimeWithOffset(HOURS[pos.row - 1], currDuration),
        })
    }

    const onResize = (pos, event) => {
        const newDuration = pos.row - HOURS.indexOf(event.start);
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
        <ScheduleSection name="לוז" withLabel={withLabel}>
            {positions.map((pos, index) => {
                if (edittable)
                    return <EmptySlot key={index} className={`col-${pos.col} row-${pos.row}`}
                        onClick={() => handleNewEvent(pos)}
                    >+</EmptySlot>
                else
                    return <Empty key={index} className={`col-${pos.col} row-${pos.row}`} />
            })}

            {positions.map((pos, index) => (
                <TimeSlot key={index} className={`col-${pos.col} row-${pos.row}`}>
                    {HOURS[pos.row - 1]}
                </TimeSlot>
            ))}



            {edittable && draggingId !== null &&
                positions.map((pos, index) => (
                    <Droppable key={index} row={pos.row} col={pos.col}
                        onPlace={() => onMove(pos)}
                    />
                ))
            }

            {edittable && resizingId !== null && (() => {
                const event = displayEvents.find(e => e.id === resizingId);
                if (!event) return null;
                const eventCol = week.findIndex(date => date === event.date) + 1;
                if (eventCol === -1) return null;
                return positions
                    .filter(pos => pos.col === eventCol)
                    .map((pos, index) => (
                        <Droppable key={index} row={pos.row} col={pos.col}
                            onPlace={() => onResize(pos, event)}
                        />
                    ));
            })()}


            {displayEvents.map((event, index) => (
                <Event key={index}
                    edittable={event.edittable}
                    event={event}
                    onStartDrag={() => setDraggingId(event.id)}
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
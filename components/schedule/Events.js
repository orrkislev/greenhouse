import { Grid } from "./Schedule";
import { formatDate } from "@/utils/utils";
import { HOURS, useUserSchedule } from "@/utils/store/scheduleDataStore";
import { useState } from "react";
import { Event } from "./Event";
import { useWeek } from "@/utils/store/scheduleDisplayStore";


export default function EventsGrid({ gridData, edittable = false }) {
    const [draggingId, setDraggingId] = useState(null);
    const [resizingId, setResizingId] = useState(null);

    const week = useWeek(state => state.week);
    const events = useUserSchedule(state => state.events)
    const updateEvent = useUserSchedule(state => state.updateEvent);

    const positions = Array(6).fill(0).map((_, col) => Array(6).fill(0).map((_, row) => ({ row, col }))).flat();

    const onPlace = pos => {
        if (draggingId === null) return;
        updateEvent(draggingId[0], {
            date: formatDate(week[pos.col]),
            start: HOURS[pos.row],
        })
    }

    const weekEvents = events.filter(event => week.some(date => formatDate(date) === event.date));

    return (
        <Grid className="z-60" style={{ ...gridData.style, pointerEvents: 'none' }}>
            {edittable && draggingId !== null &&
                positions.map((pos, index) => (
                    <Droppable key={index} row={pos.row} col={pos.col} gridData={gridData}
                        offset={draggingId[1]}
                        onPlace={() => onPlace(pos)}
                    />
                ))
            }

            {edittable && resizingId !== null && (() => {
                const event = events.find(e => e.id === resizingId);
                if (!event) return null;
                // Find the column index for the event's date
                const eventCol = week.findIndex(date => formatDate(date) === event.date);
                if (eventCol === -1) return null;
                // Only render Droppable for the event's column
                return positions
                    .filter(pos => pos.col === eventCol)
                    .map((pos, index) => (
                        <Droppable key={index} row={pos.row} col={pos.col} gridData={gridData}
                            onPlace={() => {
                                const newDuration = pos.row - HOURS.indexOf(event.start) + 1;
                                if (newDuration > 0) {
                                    updateEvent(resizingId, { duration: newDuration });
                                }
                            }}
                        />
                    ));
            })()}


            {weekEvents.map((event, index) => (
                <Event key={index}
                    firstHourRow={gridData.firstHourRow}
                    edittable={edittable}
                    event={event}
                    onStartDrag={(offset) => setDraggingId([event.id, offset])}
                    onEndDrag={() => setDraggingId(null)}
                    onStartResize={() => setResizingId(event.id)}
                    onEndResize={() => setResizingId(null)}
                />
            ))}
        </Grid>
    )
}

function Droppable({ row, col, gridData, onPlace, offset = 0 }) {
    return (
        <div
            style={{
                gridRow: row + gridData.firstHourRow,
                gridColumn: col + 2,
                zIndex: 100,
                position: 'relative',
            }}
        >
            <div className="mx-2 rounded-sm pointer-events-auto absolute inset-0"
                style={{ transform: `translateY(${offset}px)` }}
                onMouseEnter={onPlace}
            />
        </div>
    );
}





















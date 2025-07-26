import { useGroups } from "@/utils/useGroups";
import { eventsActions, useEvents } from "@/utils/useEvents";
import { useEffect } from "react";
import { HOURS } from "@/utils/useTime";

export default function useWeeksEvents(week) {
    const events = useEvents(state => state.events);
    const groups = useGroups(state => state.groups);

    useEffect(()=>{
        if (week && week.length > 0) eventsActions.loadWeekEvents(week);
    },[week]);

    if (!week || week.length === 0) return [];

    const userEvents = events.filter(event => event.date >= week[0] && event.date <= week[week.length - 1]);

    const groupEvents = groups.filter(group => group.entries).flatMap(group =>
        group.entries
            .filter(entry => entry.type === 'event')
            .filter(event => event.date >= week[0] && event.date <= week[week.length - 1])
            .filter(event => event.isMember)
    );

    return [...userEvents, ...groupEvents]
}

export function prepareEventsForSchedule(events, week, edittable = false) {
    events.forEach(event => {
        event.edittable = event.group ? false : edittable;
    })

// ------ event position --------
    events.forEach(event => {
        event.dayIndex = week.findIndex(date => date === event.date);
        event.startIndex = getHourIndex(event.start);
        event.endIndex = getHourIndex(event.end, true);
    });

    const blocks = [];
    events.forEach(event => {
        const dayIndex = week.findIndex(date => date === event.date);
        if (dayIndex === -1) return;

        const startIndex = getHourIndex(event.start);
        const endIndex = getHourIndex(event.end, true);
        // Find an existing block that fits either by startIndex or endIndex
        const existingBlock = blocks.find(block => 
            block.dayIndex === dayIndex &&
            (
            // Event is fully inside block
            (event.startIndex >= block.startIndex && event.endIndex <= block.endIndex) ||
            // Event overlaps block end
            (event.endIndex > block.startIndex && event.endIndex <= block.endIndex) ||
            // Event overlaps block start
            (event.startIndex >= block.startIndex && event.startIndex < block.endIndex) ||
            // Block is fully inside event
            (block.startIndex >= event.startIndex && block.endIndex <= event.endIndex)
            )
        );

        if (existingBlock) {
            existingBlock.events.push(event);
            existingBlock.startIndex = Math.min(existingBlock.startIndex, startIndex);
            existingBlock.endIndex = Math.max(existingBlock.endIndex, endIndex);
        } else {
            blocks.push({
                dayIndex,
                startIndex,
                endIndex,
                events: [event],
            });
        }
    });

    blocks.forEach(block => {
        block.events.forEach((event, eventIndex) => {
            event.gridStyle = {
                gridRowStart: event.startIndex + 1,
                gridRowEnd: event.endIndex + 1,
                gridColumn: event.dayIndex + 1,
                width: `calc(100% / ${block.events.length})`,
                transform: `translateX(-${eventIndex * 100}%)`,
            };
            event.eventIndex = eventIndex;
        });
    });

    return events;
}







let hoursMinutes = [...HOURS]
hoursMinutes.pop();
hoursMinutes.push('13:30');
hoursMinutes = hoursMinutes.map(toMinutes)

function toMinutes(t) {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
}

function getHourIndex(time, isEnd = false) {
    const timeMinutes = toMinutes(time);
    const exactIndex = hoursMinutes.findIndex(hm => hm === timeMinutes);
    if (isEnd && exactIndex !== -1) return exactIndex;

    let index = hoursMinutes.findIndex(hm => hm >= timeMinutes);
    if (index === -1) index = HOURS.length - 1;

    return index;
}

export function getEventDuration(event) {
    const startMinutes = toMinutes(event.start);
    const endMinutes = toMinutes(event.end);
    return Math.ceil((endMinutes - startMinutes) / 60);
}

export function getTimeWithOffset(time, offset) {
    const [h, m] = time.split(':').map(Number);
    const totalMinutes = h * 60 + m + offset;
    const newH = Math.floor(totalMinutes / 60);
    const newM = totalMinutes % 60;
    return `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;
}
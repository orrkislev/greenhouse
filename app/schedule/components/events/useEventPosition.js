import { HOURS, useWeek } from "@/app/schedule/utils/useWeek";

export function useEventPosition(event) {
    const week = useWeek(state => state.week);
    
    const dayIndex = week.findIndex(date => date === event.date);
    const startIndex = getHourIndex(event.start);
    const endIndex = getHourIndex(event.end, true);

    const gridStyle = {
        gridRowStart: startIndex + 1,
        gridRowEnd: endIndex + 1,
        gridColumn: dayIndex + 1,
    };

    return { dayIndex, startIndex, endIndex, gridStyle };
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

export function getTimeWithOffset(time, offset) {
    const [h, m] = time.split(':').map(Number);
    const totalMinutes = h * 60 + m + offset;
    const newH = Math.floor(totalMinutes / 60);
    const newM = totalMinutes % 60;
    return `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;
}
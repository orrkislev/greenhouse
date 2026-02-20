import { addHours } from "date-fns";

export const times = ['8:30', '9:30', '10:30', '11:30', '12:30', 'ערב'];
export const days = ['א', 'ב', 'ג', 'ד', 'ה', 'סופ״ש'];

export function stringToTime(timeStr) {
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
export function isInTimeSlot(timeSlotStr, eventTimeStr) {
    const timeSlotTime = stringToTime(timeSlotStr);
    let nextHour = new Date(timeSlotTime)
    if (timeSlotStr === 'ערב') nextHour.setHours(23, 59, 0, 0);
    else nextHour = addHours(nextHour, 1);
    const eventTime = stringToTime(eventTimeStr);
    const isFirstMorningSlot = timeSlotTime.getHours() === 8 && timeSlotTime.getMinutes() === 30;
    if (isFirstMorningSlot) {
        return eventTime < nextHour;
    }
    return eventTime >= timeSlotTime && eventTime < nextHour;
}

export function getEndTimeSlot(timeStr) {
    if (!timeStr || timeStr === 'ערב') return getTimeSlot(timeStr);
    const [hours, minutes] = timeStr.split(':').map(Number);
    const total = hours * 60 + minutes - 1;
    const adjusted = `${Math.floor(total / 60)}:${(total % 60).toString().padStart(2, '0')}`;
    return getTimeSlot(adjusted);
}

export function getTimeSlot(timeStr) {
    for (const timeSlot of times) {
        if (isInTimeSlot(timeSlot, timeStr)) {
            return timeSlot;
        }
    }
    return null;
}
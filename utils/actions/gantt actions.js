'use server';

import { endOfWeek, startOfWeek } from "date-fns";

export async function getGanttEvents(startDate, endDate) {
    if (!startDate || !endDate) return []

    const calendarId = 'c_46fff05f4aa78a1a4bb09a70f55984ff858d93cb98a6f0ee3f8ded715d34be00@group.calendar.google.com';

    const timeMin = startDate.toISOString();
    const timeMax = endDate.toISOString();

    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?` +
        `key=${process.env.GOOGLE_CLOUD_API}&` +
        `timeMin=${timeMin}&` +
        `timeMax=${timeMax}&` +
        `singleEvents=true&` +
        `orderBy=startTime`;
    try {
        const response = await fetch(url, { cache: 'no-store' });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.items || [];
    } catch (error) {
        throw error;
    }
}

export async function getGanttEventsWithDateRange(start, end) {
    try {
        const startDate = startOfWeek(start)
        const endDate = end ? endOfWeek(end) : endOfWeek(startDate);
        const events = await getGanttEvents(startDate, endDate);
        return { items: events };
    } catch (error) {
        throw new Error(error.message);
    }
}


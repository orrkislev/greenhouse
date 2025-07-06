import { parseDate } from "@/utils/utils";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        let start = searchParams.get('start');
        start = parseDate(start);
        if (start.getDay() !== 0) {
            start.setDate(start.getDate() - start.getDay());
        }
        

        let end = searchParams.get('end');
        if (end) {
            end = parseDate(end);
            if (end.getDay() !== 6) {
                end.setDate(end.getDate() + (6 - end.getDay()));
            }
        } else {
            end = new Date(start);
            end.setDate(start.getDate() + 7);
        }

        const events = await getGanttEvents(start, end);
        return new Response(JSON.stringify({ items: events }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}







async function getGanttEvents(startDate, endDate) {
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
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.items || [];
    } catch (error) {
        console.error('Error fetching calendar events:', error);
        throw error;
    }
}
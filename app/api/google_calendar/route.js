import { getWeekEvents } from "@/utils/GoogleCalendar";
import { parseDate } from "@/utils/utils";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        let firstDay = searchParams.get('firstDay');
        let startDate = parseDate(firstDay);
        const events = await getWeekEvents(startDate);
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

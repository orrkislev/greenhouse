export async function getWeekEvents(startDate = null) {
      const calendarId = 'c_46fff05f4aa78a1a4bb09a70f55984ff858d93cb98a6f0ee3f8ded715d34be00@group.calendar.google.com';
  
  // If no start date provided, use this Sunday
  const sunday = startDate || getThisSunday();
  const nextSunday = new Date(sunday);
  nextSunday.setDate(sunday.getDate() + 7);
  
  const timeMin = sunday.toISOString();
  const timeMax = nextSunday.toISOString();
  
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

export function getThisSunday() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - dayOfWeek);
    sunday.setHours(0, 0, 0, 0);
    return sunday;
}



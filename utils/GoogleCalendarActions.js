'use server'

import { google } from 'googleapis';


export async function getAuthUrl(redirect_url) {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        redirect_url
    );

    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/calendar.readonly'],
        prompt: 'consent',
    });

    return url;
}

export async function getRefreshToken(redirect_url, code) {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        redirect_url
    );
    try {
        const { tokens } = await oauth2Client.getToken(code);
        return tokens.refresh_token;
    } catch (err) {
        throw err;
    }
}

export async function fetchEventsFromGoogleCalendar(refreshToken, start, end) {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials({refresh_token: refreshToken,});
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    try {
        const response = await calendar.events.list({
            calendarId: 'primary',
            timeMin: new Date(start).toISOString(),
            timeMax: new Date(end).toISOString(),
            singleEvents: true,
            orderBy: 'startTime',
        });

        return response.data.items;
    } catch (error) {
        throw error;
    }
}
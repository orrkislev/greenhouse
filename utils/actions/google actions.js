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
    console.log('fetchEventsFromGoogleCalendar', start, end)
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


export async function getLatestVideoFromPlaylist(playlistId) {
    const apiKey = process.env.GOOGLE_CLOUD_API;
    const maxResults = 50;
    let nextPageToken = null;
    let lastItems = [];

    // First, get the total number of videos
    const firstUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=1&key=${apiKey}`;
    const firstResponse = await fetch(firstUrl);
    const firstData = await firstResponse.json();
    const totalVideos = firstData.pageInfo.totalResults;

    // Calculate how many pages we need
    const totalPages = Math.ceil(totalVideos / maxResults);

    // Now, page through to the last page
    let pageCount = 0;
    let url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=${maxResults}&key=${apiKey}`;
    let data;

    do {
        const response = await fetch(url + (nextPageToken ? `&pageToken=${nextPageToken}` : ''));
        data = await response.json();
        pageCount++;
        nextPageToken = data.nextPageToken;
        lastItems = data.items;
    } while (nextPageToken && pageCount < totalPages);

    // The last item in the last page is the latest video
    const latestVideo = lastItems[lastItems.length - 1];
    return latestVideo.snippet.resourceId.videoId;
}

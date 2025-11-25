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
    scope: [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/documents',
      'https://www.googleapis.com/auth/drive.file',
    ],
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
    console.error('Error getting refresh token', err);
  }
}

export async function fetchEventsFromGoogleCalendar(refreshToken, start, end) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  oauth2Client.setCredentials({ refresh_token: refreshToken, });
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






export async function createGoogleDoc({ refreshToken, name, title, subtitle }) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  oauth2Client.setCredentials({ refresh_token: refreshToken, });

  // 3. Create Google Doc
  const docs = google.docs({ version: 'v1', auth: oauth2Client });
  const createRes = await docs.documents.create({ requestBody: { title: name } });
  const docId = createRes.data.documentId;

  // 4. Add subtitle
  await docs.documents.batchUpdate({
    documentId: docId,
    requestBody: {
      requests: [
        {
          insertText: {
            location: { index: 1 }, // Start after the initial empty paragraph
            text: title + '\n' + subtitle + '\n'
          }
        },
        {
          updateTextStyle: {
            range: { startIndex: 1, endIndex: 1 + title.length },
            textStyle: {
              fontSize: { magnitude: 24, unit: 'PT' },
              bold: true
            },
            fields: 'fontSize,bold'
          }
        },
        {
          updateTextStyle: {
            range: {
              startIndex: 1 + title.length + 1, // +1 for the newline
              endIndex: 1 + title.length + 1 + subtitle.length
            },
            textStyle: {
              fontSize: { magnitude: 16, unit: 'PT' },
              bold: false
            },
            fields: 'fontSize,bold'
          }
        }
      ]
    }
  });

  console.log('docId', docId);

  // 5. Share it with staff@chamama.org
  await docs.documents.batchUpdate({
    documentId: docId,
    requestBody: {
      requests: [
        {
          updateDocumentProperties: {
            documentProperties: {
              title: name,
              revisionHistoryDurationLimit: {
                seconds: 60,
                nanos: 0
              }
            }
          }
        }
      ]
    }
  });
  const drive = google.drive({ version: 'v3', auth: oauth2Client });
  await drive.permissions.create({
    fileId: docId,
    requestBody: {
      role: 'reader',
      type: 'user',
      emailAddress: 'staff@chamama.org'
    },
    sendNotificationEmail: false,
  });


  return `https://docs.google.com/document/d/${docId}/edit`;
}
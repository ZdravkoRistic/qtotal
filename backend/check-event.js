const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');

const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
const TOKEN_PATH = path.join(__dirname, 'token.json');

async function getAuthClient() {
    const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH, 'utf-8'));
    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;

    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    const token = JSON.parse(await fs.readFile(TOKEN_PATH, 'utf-8'));
    oAuth2Client.setCredentials(token);

    return oAuth2Client;
}

async function checkCalendarEvent(eventId) {
    try {
        const auth = await getAuthClient();
        const calendar = google.calendar({ version: 'v3', auth });

        console.log('🔍 Checking for event:', eventId);

        const event = await calendar.events.get({
            calendarId: 'primary',
            eventId: eventId
        });

        console.log('\n✅ EVENT FOUND!\n');
        console.log('Summary:', event.data.summary);
        console.log('Start:', event.data.start.dateTime);
        console.log('End:', event.data.end.dateTime);
        console.log('Status:', event.data.status);
        console.log('Attendees:', event.data.attendees);
        console.log('\n📅 View in Calendar:');
        console.log(event.data.htmlLink);

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.code === 404) {
            console.log('Event not found in calendar!');
        }
    }
}

// Proverite event iz MongoDB
checkCalendarEvent('ujfqk53cul1l2p72g4m74pj94s');

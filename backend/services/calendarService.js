const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');

// Putanje do credentials fajlova
const CREDENTIALS_PATH = path.join(__dirname, '..', 'credentials.json');
const TOKEN_PATH = path.join(__dirname, '..', 'token.json');

// Scope za Google Calendar API
const SCOPES = ['https://www.googleapis.com/auth/calendar'];

/**
 * Učitava credentials i kreira OAuth2 klijenta
 */
async function getAuthClient() {
    try {
        // Učitaj credentials
        const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH, 'utf-8'));
        const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;

        const oAuth2Client = new google.auth.OAuth2(
            client_id,
            client_secret,
            redirect_uris[0]
        );

        // Pokušaj učitati postojeći token
        try {
            const token = JSON.parse(await fs.readFile(TOKEN_PATH, 'utf-8'));
            oAuth2Client.setCredentials(token);
            console.log('✅ OAuth2 token loaded from token.json');
        } catch (err) {
            // Ako token ne postoji, potrebna je autentifikacija
            console.log('⚠️ Token not found. Run authorization flow first.');
            console.log('📝 Instructions:');
            console.log('   1. Run: node services/calendarService.js');
            console.log('   2. Follow the authorization URL');
            console.log('   3. Paste the code back');
            throw new Error('OAuth token missing. Please authorize first.');
        }

        return oAuth2Client;
    } catch (error) {
        console.error('❌ Error loading credentials:', error.message);
        throw error;
    }
}

/**
 * Kreira Google Calendar event i šalje pozivnicu
 * @param {Object} params - { contactId, clientEmail, clientName, dateTimeString, proposedTimes }
 * @returns {Object} - { eventId, eventLink, success }
 */
async function createCalendarEvent({ contactId, clientEmail, clientName, dateTimeString, proposedTimes }) {
    try {
        console.log('📅 Creating Google Calendar event...');
        console.log('   Client:', clientName, `(${clientEmail})`);
        console.log('   DateTime:', dateTimeString);

        const auth = await getAuthClient();
        const calendar = google.calendar({ version: 'v3', auth });

        // Parse datetime string u ISO format
        const eventDateTime = parseDateTimeToISO(dateTimeString);

        if (!eventDateTime) {
            throw new Error(`Could not parse datetime: ${dateTimeString}`);
        }

        // Krajnje vreme (1 sat kasnije)
        const endDateTime = new Date(eventDateTime);
        endDateTime.setHours(endDateTime.getHours() + 1);

        // Event detalji
        const event = {
            summary: `Sastanak sa ${clientName} - Q-Total`,
            description: `Zakazan sastanak sa klijentom ${clientName}\nEmail: ${clientEmail}\nContact ID: ${contactId}`,
            start: {
                dateTime: eventDateTime.toISOString(),
                timeZone: 'Europe/Belgrade',
            },
            end: {
                dateTime: endDateTime.toISOString(),
                timeZone: 'Europe/Belgrade',
            },
            attendees: [
                { email: clientEmail, responseStatus: 'accepted' },
                { email: process.env.ADMIN_EMAIL }
            ],
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 24 * 60 }, // 1 dan pre
                    { method: 'popup', minutes: 30 }, // 30min pre
                ],
            },
            guestsCanModify: false,
            sendUpdates: 'all', // Šalje pozivnicu svim učesnicima
        };

        // Kreiraj event
        const response = await calendar.events.insert({
            calendarId: 'primary',
            resource: event,
            sendUpdates: 'all', // Automatski šalje calendar invite
        });

        console.log('✅ Calendar event created successfully!');
        console.log('   Event ID:', response.data.id);
        console.log('   Event Link:', response.data.htmlLink);

        return {
            success: true,
            eventId: response.data.id,
            eventLink: response.data.htmlLink,
            startTime: eventDateTime.toISOString(),
            endTime: endDateTime.toISOString()
        };

    } catch (error) {
        console.error('❌ Error creating calendar event:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Parsira datum string u ISO format
 * Format: "Ponedeljak, 2. decembar u 10:00"
 * @param {String} dateTimeString
 * @returns {Date|null}
 */
function parseDateTimeToISO(dateTimeString) {
    try {
        // Primer: "Ponedeljak, 2. decembar u 10:00"
        const regex = /(\d+)\.\s*(\w+)\s+u\s+(\d+):(\d+)/;
        const match = dateTimeString.match(regex);

        if (!match) {
            console.error('⚠️ Could not parse datetime string:', dateTimeString);
            return null;
        }

        const day = parseInt(match[1]);
        const monthName = match[2].toLowerCase();
        const hour = parseInt(match[3]);
        const minute = parseInt(match[4]);

        // Mapa meseci
        const months = {
            'januar': 0, 'februar': 1, 'mart': 2, 'april': 3,
            'maj': 4, 'jun': 5, 'jul': 6, 'avgust': 7,
            'septembar': 8, 'oktobar': 9, 'novembar': 10, 'decembar': 11
        };

        const month = months[monthName];
        if (month === undefined) {
            console.error('⚠️ Unknown month:', monthName);
            return null;
        }

        // Kreiraj datum (pretpostavljamo tekuću ili sledeću godinu)
        const now = new Date();
        let year = now.getFullYear();

        // Ako je mesec prošao ove godine, prebaci na sledeću
        if (month < now.getMonth() || (month === now.getMonth() && day < now.getDate())) {
            year++;
        }

        const eventDate = new Date(year, month, day, hour, minute, 0);

        console.log('📅 Parsed datetime:', eventDate.toISOString());
        return eventDate;

    } catch (error) {
        console.error('❌ Error parsing datetime:', error);
        return null;
    }
}

/**
 * HELPER: Generisanje OAuth tokena (run jednom)
 * Pokreni: node services/calendarService.js
 */
async function generateToken() {
    const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH, 'utf-8'));
    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;

    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });

    console.log('🔐 Authorize this app by visiting this URL:');
    console.log(authUrl);
    console.log('\n📝 After authorization, paste the code here:');

    // U production, koristićemo readline da primimo code
    // Za sada, ovo je helper funkcija
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    readline.question('Enter code: ', async (code) => {
        readline.close();
        try {
            const { tokens } = await oAuth2Client.getToken(code);
            oAuth2Client.setCredentials(tokens);

            // Sačuvaj token
            await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens));
            console.log('✅ Token saved to:', TOKEN_PATH);
            console.log('🎉 Authorization complete! You can now use the Calendar API.');
        } catch (err) {
            console.error('❌ Error retrieving access token:', err);
        }
    });
}

// Ako se pokrene direktno, generiši token
if (require.main === module) {
    console.log('🚀 Running OAuth2 authorization flow...\n');
    generateToken().catch(console.error);
}

module.exports = {
    createCalendarEvent,
    getAuthClient
};

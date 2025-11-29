const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import services
const { processClientInquiry } = require('./services/geminiService');
const { sendClientEmail, sendAdminNotification, testEmailConnection } = require('./services/emailService');
const { createCalendarEvent } = require('./services/calendarService');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON bodies

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/qtotal';

mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
})
    .then(() => {
        console.log(`✅ Connected to MongoDB at ${MONGODB_URI}`);
        console.log(`📊 Connection state: ${mongoose.connection.readyState}`);
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err.message);
        console.log('⚠️  Server will continue in MOCK MODE (requests accepted but not saved to DB)');
    });

// Monitor connection events
mongoose.connection.on('disconnected', () => {
    console.log('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB error:', err.message);
});

// Schema Definition
const contactSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    message: String,
    timestamp: { type: Date, default: Date.now },
    status: { type: String, default: 'processing' }, // processing -> email_sent -> completed

    // AI Classification
    serviceType: String, // "Konsalting" ili "Obuke"
    geminiConfidence: Number, // 0-100
    aiReasoning: String,

    // AI Response
    aiResponse: String,
    proposedMeetingTimes: [String],

    // Email tracking
    emailSentToClient: { type: Boolean, default: false },
    emailSentToAdmin: { type: Boolean, default: false },
    clientEmailMessageId: String,
    adminEmailMessageId: String,

    // Calendar (za buduću implementaciju)
    calendarEventId: String,
    confirmedMeetingTime: String
});

const Contact = mongoose.model('Contact', contactSchema);

// Routes
app.get('/', (req, res) => {
    res.send('Q-TOTAL Backend is running!');
});

app.post('/api/contact', async (req, res) => {
    console.log('\n========================================');
    console.log('📨 NEW REQUEST RECEIVED');
    console.log('========================================');
    console.log('📋 Request Body:', JSON.stringify(req.body, null, 2));
    console.log('🔌 MongoDB Connection State:', mongoose.connection.readyState);
    console.log('   (0=disconnected, 1=connected, 2=connecting, 3=disconnecting)');

    try {
        // 1. PROVERA MONGODB KONEKCIJE
        if (mongoose.connection.readyState !== 1) {
            console.log('⚠️ MongoDB not connected. MOCK MODE: Data received but not saved to DB.');
            return res.status(200).json({
                message: 'Message received (Mock Mode - DB offline)',
                data: req.body
            });
        }

        console.log('✅ MongoDB is connected. Starting AI workflow...');

        // 2. KREIRANJE INICIJALNOG ZAPISA U BAZI (status: processing)
        const newContact = new Contact({
            ...req.body,
            status: 'processing'
        });

        await newContact.save();
        console.log('✅ Initial contact saved to DB with status: processing');

        // 3. GEMINI AI - KLASIFIKACIJA I GENERISANJE ODGOVORA
        console.log('🤖 Calling Gemini AI service...');
        const aiResult = await processClientInquiry(req.body);

        console.log('✅ Gemini AI processing complete:');
        console.log('   - Service Type:', aiResult.serviceType);
        console.log('   - Confidence:', aiResult.confidence + '%');
        console.log('   - Proposed Times:', aiResult.proposedTimes.length);

        // 4. AŽURIRANJE ZAPISA SA AI REZULTATIMA
        newContact.serviceType = aiResult.serviceType;
        newContact.geminiConfidence = aiResult.confidence;
        newContact.aiReasoning = aiResult.reasoning;
        newContact.aiResponse = aiResult.aiResponse;
        newContact.proposedMeetingTimes = aiResult.proposedTimes;

        await newContact.save();
        console.log('✅ Contact updated with AI results');

        // 5. SLANJE EMAILA KLIJENTU
        console.log('📧 Sending email to client...');
        try {
            const clientEmailResult = await sendClientEmail({
                contactId: newContact._id.toString(),
                clientEmail: req.body.email,
                clientName: req.body.name,
                aiResponse: aiResult.aiResponse,
                proposedTimes: aiResult.proposedTimes
            });

            newContact.emailSentToClient = true;
            newContact.clientEmailMessageId = clientEmailResult.messageId;
            console.log('✅ Email sent to client successfully');
        } catch (emailError) {
            console.error('❌ Failed to send email to client:', emailError.message);
        }

        // 6. SLANJE NOTIFIKACIJE ADMINU
        console.log('📧 Sending notification to admin...');
        try {
            const adminEmailResult = await sendAdminNotification({
                contactData: req.body,
                classification: {
                    serviceType: aiResult.serviceType,
                    confidence: aiResult.confidence,
                    reasoning: aiResult.reasoning
                },
                aiResponse: aiResult.aiResponse
            });

            newContact.emailSentToAdmin = true;
            newContact.adminEmailMessageId = adminEmailResult.messageId;
            console.log('✅ Notification sent to admin successfully');
        } catch (emailError) {
            console.error('❌ Failed to send notification to admin:', emailError.message);
        }

        // 7. FINALNO AŽURIRANJE STATUSA
        newContact.status = 'email_sent';
        await newContact.save();

        console.log('========================================');
        console.log('✅ WORKFLOW COMPLETED SUCCESSFULLY!');
        console.log('========================================\n');

        // 8. ODGOVOR KLIJENTU (FRONTEND)
        res.status(201).json({
            message: 'Message sent successfully!',
            data: {
                id: newContact._id,
                status: newContact.status,
                serviceType: aiResult.serviceType,
                emailSent: newContact.emailSentToClient
            }
        });

    } catch (error) {
        console.error('❌ ERROR OCCURRED:');
        console.error('   Error Type:', error.name);
        console.error('   Error Message:', error.message);
        console.error('   Full Error:', error);
        console.log('========================================\n');

        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Confirmation Endpoint - kada klijent klikne na dugme u emailu
app.get('/api/confirm', async (req, res) => {
    console.log('\n========================================');
    console.log('✅ CONFIRMATION REQUEST RECEIVED');
    console.log('========================================');

    const { id, time } = req.query;

    try {
        if (!id || time === undefined) {
            return res.status(400).send(`
                <html>
                    <body style="font-family: Arial; text-align: center; padding: 50px;">
                        <h1 style="color: #e74c3c;">❌ Greška</h1>
                        <p>Nevažeći link za potvrdu.</p>
                    </body>
                </html>
            `);
        }

        // Pronađi kontakt u bazi
        const contact = await Contact.findById(id);

        if (!contact) {
            return res.status(404).send(`
                <html>
                    <body style="font-family: Arial; text-align: center; padding: 50px;">
                        <h1 style="color: #e74c3c;">❌ Greška</h1>
                        <p>Kontakt nije pronađen.</p>
                    </body>
                </html>
            `);
        }

        // Proveri da li je termin već potvrđen
        if (contact.confirmedMeetingTime) {
            return res.send(`
                <html>
                    <head>
                        <meta charset="UTF-8">
                        <title>Već Potvrđeno - Q-Total</title>
                    </head>
                    <body style="font-family: Arial; text-align: center; padding: 50px; background-color: #f9f9f9;">
                        <div style="background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 600px; margin: 0 auto;">
                            <h1 style="color: #f39c12;">⚠️ Sastanak već zakazan</h1>
                            <p style="font-size: 18px; color: #555;">Već ste potvrdili sastanak:</p>
                            <p style="font-size: 20px; font-weight: bold; color: #27ae60;">${contact.confirmedMeetingTime}</p>
                            <p style="color: #888;">Pozivnica je već poslata na vašu email adresu.</p>
                        </div>
                    </body>
                </html>
            `);
        }

        const timeIndex = parseInt(time);
        const confirmedTime = contact.proposedMeetingTimes[timeIndex];

        if (!confirmedTime) {
            return res.status(400).send(`
                <html>
                    <body style="font-family: Arial; text-align: center; padding: 50px;">
                        <h1 style="color: #e74c3c;">❌ Greška</h1>
                        <p>Nevažeći termin.</p>
                    </body>
                </html>
            `);
        }

        console.log('📅 Creating calendar event for:', confirmedTime);
        console.log('   Client:', contact.name, `(${contact.email})`);

        // Kreiraj Google Calendar event
        const calendarResult = await createCalendarEvent({
            contactId: id,
            clientEmail: contact.email,
            clientName: contact.name,
            dateTimeString: confirmedTime,
            proposedTimes: contact.proposedMeetingTimes
        });

        if (calendarResult.success) {
            // Ažuriraj MongoDB
            contact.confirmedMeetingTime = confirmedTime;
            contact.calendarEventId = calendarResult.eventId;
            contact.status = 'completed';
            await contact.save();

            console.log('✅ Calendar event created successfully!');
            console.log('   Event ID:', calendarResult.eventId);
            console.log('========================================\n');

            // Prikaži success stranicu
            return res.send(`
                <html>
                    <head>
                        <meta charset="UTF-8">
                        <title>Sastanak Zakazan - Q-Total</title>
                    </head>
                    <body style="font-family: Arial; text-align: center; padding: 50px; background-color: #f9f9f9;">
                        <div style="background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 600px; margin: 0 auto;">
                            <h1 style="color: #27ae60;">✅ Sastanak uspešno zakazan!</h1>
                            <p style="font-size: 18px; color: #555;">Hvala što ste potvrdili, ${contact.name}!</p>
                            <div style="background: #e8f5e9; padding: 20px; border-radius: 5px; margin: 20px 0;">
                                <p style="font-size: 16px; margin: 5px 0;"><strong>Termin:</strong></p>
                                <p style="font-size: 22px; font-weight: bold; color: #27ae60; margin: 10px 0;">${confirmedTime}</p>
                            </div>
                            <p style="color: #888;">📧 Pozivnica za sastanak je poslata na vašu email adresu.</p>
                            <p style="color: #888;">📅 Dodajte ga u svoj kalendar klikom na link u emailu.</p>
                            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                            <p style="color: #888; font-size: 14px;">
                                Q-Total - IT Konsalting i Obuke<br>
                                Email: qtotal.rs@gmail.com
                            </p>
                        </div>
                    </body>
                </html>
            `);
        } else {
            // Calendar kreiranje nije uspelo
            console.error('❌ Failed to create calendar event:', calendarResult.error);
            console.log('========================================\n');

            return res.send(`
                <html>
                    <head>
                        <meta charset="UTF-8">
                        <title>Greška - Q-Total</title>
                    </head>
                    <body style="font-family: Arial; text-align: center; padding: 50px; background-color: #f9f9f9;">
                        <div style="background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 600px; margin: 0 auto;">
                            <h1 style="color: #e74c3c;">❌ Greška prilikom zakazivanja</h1>
                            <p style="font-size: 18px; color: #555;">Vaš izbor je zabeležen:</p>
                            <p style="font-size: 20px; font-weight: bold; color: #3498db;">${confirmedTime}</p>
                            <p style="color: #888;">Međutim, došlo je do problema sa kreiranjem kalendar eventa.</p>
                            <p style="color: #888;">Javićemo vam se uskoro sa potvrdom.</p>
                            <p style="color: #e74c3c; font-size: 14px; margin-top: 20px;">Greška: ${calendarResult.error}</p>
                        </div>
                    </body>
                </html>
            `);
        }

    } catch (error) {
        console.error('❌ ERROR in /api/confirm:', error);
        console.log('========================================\n');

        return res.status(500).send(`
            <html>
                <body style="font-family: Arial; text-align: center; padding: 50px;">
                    <h1 style="color: #e74c3c;">❌ Server Greška</h1>
                    <p>Došlo je do greške. Molimo pokušajte ponovo kasnije.</p>
                    <p style="color: #888; font-size: 14px;">${error.message}</p>
                </body>
            </html>
        `);
    }
});

// Start Server
app.listen(PORT, async () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);

    // Test email connection
    console.log('📧 Testing email connection...');
    await testEmailConnection();
});

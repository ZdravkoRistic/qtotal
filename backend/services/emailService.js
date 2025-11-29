const nodemailer = require('nodemailer');

// Konfiguracija email transportera (Gmail SMTP)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/**
 * Šalje email klijentu sa AI generisanim odgovorom
 * @param {Object} params - { contactId, clientEmail, clientName, aiResponse, proposedTimes }
 */
async function sendClientEmail({ contactId, clientEmail, clientName, aiResponse, proposedTimes }) {
    try {
        // Kreiranje HTML dugmića za svaki termin
        const baseURL = process.env.BASE_URL || 'http://localhost:5000';
        const timesHTML = proposedTimes.map((time, index) => `
            <div style="margin: 10px 0;">
                <a href="${baseURL}/api/confirm?id=${contactId}&time=${index}" 
                   style="display: inline-block; background-color: #27ae60; color: white; 
                          padding: 12px 25px; text-decoration: none; border-radius: 5px; 
                          font-weight: bold; transition: background-color 0.3s;">
                    ✅ Potvrdi: ${time}
                </a>
            </div>
        `).join('');

        const mailOptions = {
            from: `"Q-Total" <${process.env.EMAIL_USER}>`,
            to: clientEmail,
            subject: 'Odgovor na vaš upit - Q-Total',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                    <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h2 style="color: #2c3e50; margin-bottom: 20px;">Q-Total - IT Konsalting i Obuke</h2>
                        
                        <div style="color: #34495e; line-height: 1.6; white-space: pre-line;">
${aiResponse}
                        </div>
                        
                        <div style="margin-top: 30px; padding: 20px; background-color: #ecf0f1; border-radius: 5px;">
                            <h3 style="color: #2c3e50; margin-top: 0;">📅 Predloženi termini za sastanak:</h3>
                            <p style="color: #7f8c8d; font-size: 14px; margin-bottom: 20px;">
                                Kliknite na dugme da potvrdite termin koji vam odgovara. 
                                Automatski ćemo zakazati sastanak i poslati vam pozivnicu u kalendar.
                            </p>
                            ${timesHTML}
                        </div>
                        
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #ecf0f1; color: #7f8c8d; font-size: 12px;">
                            <p>Q-Total - IT Konsalting i Obuke</p>
                            <p>Email: qtotal.rs@gmail.com</p>
                        </div>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email poslat klijentu:', clientEmail, '| Message ID:', info.messageId);
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error('❌ Greška pri slanju emaila klijentu:', error);
        throw error;
    }
}

/**
 * Šalje notifikaciju adminu o novom upitu
 * @param {Object} params - { contactData, classification, aiResponse }
 */
async function sendAdminNotification({ contactData, classification, aiResponse }) {
    try {
        const { name, email, phone, message } = contactData;
        const { serviceType, confidence, reasoning } = classification;

        const mailOptions = {
            from: `"Q-Total System" <${process.env.EMAIL_USER}>`,
            to: process.env.ADMIN_EMAIL,
            subject: `🔔 Nova poruka - ${serviceType} (${confidence}% confidence)`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
                    <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h2 style="color: #e74c3c; margin-bottom: 20px;">🔔 Nova poruka od klijenta</h2>
                        
                        <div style="background-color: #3498db; color: white; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                            <h3 style="margin: 0;">AI Klasifikacija: ${serviceType}</h3>
                            <p style="margin: 5px 0 0 0;">Pouzdanost: ${confidence}%</p>
                            <p style="margin: 5px 0 0 0; font-size: 14px;">Razlog: ${reasoning}</p>
                        </div>
                        
                        <div style="background-color: #ecf0f1; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
                            <h3 style="color: #2c3e50; margin-top: 0;">📋 Podaci klijenta:</h3>
                            <p><strong>Ime:</strong> ${name}</p>
                            <p><strong>Email:</strong> ${email}</p>
                            <p><strong>Telefon:</strong> ${phone || 'Nije naveden'}</p>
                            <p><strong>Poruka:</strong></p>
                            <div style="background-color: white; padding: 15px; border-left: 4px solid #3498db; margin-top: 10px;">
                                ${message}
                            </div>
                        </div>
                        
                        <div style="background-color: #e8f5e9; padding: 20px; border-radius: 5px; border-left: 4px solid #27ae60;">
                            <h3 style="color: #27ae60; margin-top: 0;">✅ AI Odgovor poslat klijentu:</h3>
                            <div style="color: #2c3e50; white-space: pre-line; line-height: 1.6;">
${aiResponse}
                            </div>
                        </div>
                        
                        <div style="margin-top: 20px; padding: 15px; background-color: #fff3cd; border-radius: 5px; border-left: 4px solid #ffc107;">
                            <p style="margin: 0; color: #856404;">
                                ⏳ <strong>Akcija potrebna:</strong> Čekajte odgovor klijenta sa potvrdom termina.
                            </p>
                        </div>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Notifikacija poslata adminu | Message ID:', info.messageId);
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error('❌ Greška pri slanju notifikacije adminu:', error);
        throw error;
    }
}

/**
 * Testira email konfiguraciju
 */
async function testEmailConnection() {
    try {
        await transporter.verify();
        console.log('✅ Email server je spreman za slanje poruka');
        return true;
    } catch (error) {
        console.error('❌ Email server nije dostupan:', error.message);
        return false;
    }
}

module.exports = {
    sendClientEmail,
    sendAdminNotification,
    testEmailConnection
};

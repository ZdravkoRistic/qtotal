const { GoogleGenerativeAI } = require('@google/generative-ai');

// Inicijalizacija Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

/**
 * Klasifikuje upit klijenta i generiše odgovor
 * @param {Object} contactData - Podaci iz kontakt forme
 * @returns {Object} - { serviceType, confidence, aiResponse, proposedTimes }
 */
async function processClientInquiry(contactData) {
    try {
        const { name, email, message } = contactData;

        // 1. KLASIFIKACIJA UPITA
        const classificationPrompt = `
Analiziraj sledeću poruku klijenta i klasifikuj je kao "Konsalting" ili "Obuke".

Poruka: "${message}"

Odgovori SAMO u JSON formatu bez dodatnog teksta:
{
    "serviceType": "Konsalting" ili "Obuke",
    "confidence": broj između 0 i 100,
    "reasoning": "kratko objašnjenje zašto si tako klasifikovao"
}
`;

        const classificationResult = await model.generateContent(classificationPrompt);
        const classificationText = classificationResult.response.text();

        // Parsiranje JSON odgovora (uklanjanje markdown code block-ova ako postoje)
        const cleanedText = classificationText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const classification = JSON.parse(cleanedText);

        console.log('📊 Gemini klasifikacija:', classification);

        // 2. GENERISANJE PERSONALIZOVANOG ODGOVORA
        const responsePrompt = `
Ti si profesionalni asistent kompanije Q-Total koja pruža IT konsalting i obuke.

Klijent je poslao sledeću poruku:
Ime: ${name}
Email: ${email}
Poruka: "${message}"

Klasifikacija: ${classification.serviceType}

Napiši profesionalan, prijatan i personalizovan odgovor na srpskom jeziku koji:
1. Pozdravlja klijenta po imenu
2. Zahvaljuje se na kontaktu
3. Potvrđuje razumevanje njihovog zahteva
4. Kratko objašnjava kako možemo pomoći
5. Predlaže da zakažemo sastanak da razgovaramo o detaljima
6. Završava profesionalnim potpisom "Q-Total Tim"

Odgovor treba da bude topao, profesionalan i ne duži od 150 reči.
`;

        const responseResult = await model.generateContent(responsePrompt);
        const aiResponse = responseResult.response.text().trim();

        console.log('✍️ Gemini generisan odgovor:', aiResponse);

        // 3. GENERISANJE PREDLOŽENIH TERMINA (sledeća 2 nedelje, radni dani)
        const proposedTimes = generateMeetingTimes();

        return {
            serviceType: classification.serviceType,
            confidence: classification.confidence,
            aiResponse: aiResponse,
            proposedTimes: proposedTimes,
            reasoning: classification.reasoning
        };

    } catch (error) {
        console.error('❌ Greška u Gemini servisu:', error);

        // Fallback odgovor ako AI ne radi
        return {
            serviceType: 'Nepoznato',
            confidence: 0,
            aiResponse: `Poštovani/a ${contactData.name},\n\nHvala što ste nas kontaktirali. Primili smo vašu poruku i javićemo vam se u najkraćem mogućem roku.\n\nSrdačan pozdrav,\nQ-Total Tim`,
            proposedTimes: generateMeetingTimes(),
            reasoning: 'AI servis trenutno nije dostupan'
        };
    }
}

/**
 * Generiše 3 predložena termina za sastanak
 * @returns {Array} - Niz stringova sa terminima
 */
function generateMeetingTimes() {
    const times = [];
    const now = new Date();
    let daysAdded = 0;
    let currentDate = new Date(now);

    // Generišemo 3 termina u sledećih 10 radnih dana
    while (times.length < 3 && daysAdded < 15) {
        currentDate.setDate(now.getDate() + daysAdded);

        const dayOfWeek = currentDate.getDay();

        // Preskačemo vikende (0 = nedelja, 6 = subota)
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            const dayName = getDayName(dayOfWeek);
            const dateStr = currentDate.getDate();
            const monthName = getMonthName(currentDate.getMonth());

            // Različita vremena za svaki termin
            const timeSlots = ['10:00', '14:00', '11:00'];
            const time = timeSlots[times.length];

            times.push(`${dayName}, ${dateStr}. ${monthName} u ${time}`);
        }

        daysAdded++;
    }

    return times;
}

/**
 * Vraća naziv dana na srpskom
 */
function getDayName(dayIndex) {
    const days = ['Nedelja', 'Ponedeljak', 'Utorak', 'Sreda', 'Četvrtak', 'Petak', 'Subota'];
    return days[dayIndex];
}

/**
 * Vraća naziv meseca na srpskom
 */
function getMonthName(monthIndex) {
    const months = ['januar', 'februar', 'mart', 'april', 'maj', 'jun',
        'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'];
    return months[monthIndex];
}

module.exports = {
    processClientInquiry
};

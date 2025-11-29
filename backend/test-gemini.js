const https = require('https');

require('dotenv').config();
const API_KEY = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

console.log('🔍 Listing available models via REST API...');

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const response = JSON.parse(data);
            if (response.error) {
                console.error('❌ API Error:', response.error);
            } else if (response.models) {
                console.log('✅ Available Models:');
                response.models.forEach(model => {
                    console.log(`- ${model.name} (${model.version}) - ${model.supportedGenerationMethods.join(', ')}`);
                });
            } else {
                console.log('⚠️ No models found or unexpected response:', response);
            }
        } catch (e) {
            console.error('❌ Error parsing response:', e);
            console.log('Raw response:', data);
        }
    });

}).on('error', (err) => {
    console.error('❌ Network Error:', err);
});

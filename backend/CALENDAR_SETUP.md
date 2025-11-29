# 🔐 Google Calendar OAuth Setup - Uputstvo

## 📋 TRENUTNI STATUS

✅ **Backend kod je spreman!** Svi fajlovi su kreirani:
- `services/calendarService.js` - Google Calendar integracija
- `/api/confirm` endpoint - Prijem potvrda
- Email template sa dugmićima

⏳ **Potrebno je:**
1. Preuzeti `credentials.json` iz Google Cloud konzole
2. Pokrenuti OAuth autorizaciju
3. Testirati kompletan workflow

---

## 🚀 KORACI ZA ZAVRŠETAK

### Korak 1: Preuzimanje credentials.json

Nakon što završite Google Cloud setup (tačke 2 i 3 koje radite), uradite sledeće:

1. U Google Cloud Console-i, posle kreiranja OAuth2 credentials
2. Kliknite na **Download JSON** dugme
3. **Preimenujte fajl u `credentials.json`**
4. **Kopirajte ga u:** `c:\Coding\qtotal-webiste\qtotal-main\backend\credentials.json`

---

### Korak 2: OAuth Autorizacija (Prvi Put)

Kada stavite `credentials.json` na mesto, pokrenite ovu komandu:

```bash
cd c:\Coding\qtotal-webiste\qtotal-main\backend
node services/calendarService.js
```

**Šta će se desiti:**
1. Otvoriće se browser sa Google autorizacionim linkovima
2. Izaberite vaš Gmail nalog (`qtotal.rs@gmail.com`)
3. Kliknite **"Allow"** za Calendar pristup
4. Google će vas redirektovati na localhost (ok je ako pokazuje grešku)
5. **Kopirajte `code` parametar** iz URL-a (npr: `http://localhost/?code=4/0AY0e...`)
6. **Zalepite taj code** u terminal gde je script čeka
7. Script će kreirati `token.json` automatski

**Nakon toga:**
- ✅ `token.json` je kreiran
- ✅ Autentifikacija je završena
- ✅ Više nećete morati da radite ovaj korak

---

### Korak 3: Restartovanje Servera

```bash
# Zaustavite trenutni server (Ctrl+C)
# Pokrenite ponovo:
npm start
```

Server će sada učitati Calendar servis i biti spreman za kreiranje eventa!

---

## 🧪 TESTIRANJE

### Test 1: Slanje Forme
1. Idi na https://qtotal.vercel.app/
2. Popuni kontakt formu
3. Pošalji

**Očekivano:**
- ✅ Primiš email sa AI odgovorom
- ✅ U emailu vidiš 3 zelena dugmeta "✅ Potvrdi: [termin]"

---

### Test 2: Potvrda Termina
1. U primljenom emailu, klikni na jedno od dugmadi
2. Otvoriće se browser sa confirmation stranicom

**Očekivano:**
- ✅ Stranica prikazuje: "✅ Sastanak uspešno zakazan!"
- ✅ Google Calendar invite stiže na `qtotal.rs@gmail.com`
- ✅ Invite stiže i klijentu (ako koristiš drugi email za test)
- ✅ MongoDB status: `completed`

---

### Test 3: Provera Kalendara
1. Idi na https://calendar.google.com/
2. Uloguj se sa `qtotal.rs@gmail.com`
3. Pronađi event u kalendaru

**Očekivano:**
- ✅ Event je kreiran sa ispravnim datumom/vremenom
- ✅ Učesnici: ti i klijent
- ✅ Naslov: "Sastanak sa [Ime Klijenta] - Q-Total"

---

## ⚠️ MOGUĆI PROBLEMI

### Problem 1: "OAuth token missing"
**Uzrok:** Niste pokrenuli OAuth flow ili `token.json` ne postoji  
**Rešenje:** Pokrenite `node services/calendarService.js` ponovo

### Problem 2: "Could not parse datetime"
**Uzrok:** Datum u emailu nije u očekivanom formatu  
**Rešenje:** Proveri format u `geminiService.js` - treba da bude: "Ponedeljak, 2. decembar u 10:00"

### Problem 3: Calendar event se ne kreira
**Uzrok:** Google Calendar API nije enabled ili credentials nisu validni  
**Rešenje:** 
- Proveri da li je Calendar API enabled u Google Cloud
- Proveri da li je `credentials.json` ispravan
- Regeneriši OAuth token: `node services/calendarService.js`

---

## 📂 STRUKTURA FAJLOVA (Finalna)

```
backend/
├── credentials.json          ✅ [KORISNIK DODAJE] Google OAuth credentials
├── token.json                ✅ [AUTO-GENERISAN] Nakon OAuth flow-a
├── .env                      ✅ [AŽURIRANO] BASE_URL + Calendar config
├── server.js                 ✅ [AŽURIRANO] + /api/confirm endpoint
├── services/
│   ├── geminiService.js      ✅ [POSTOJEĆI]
│   ├── emailService.js       ✅ [AŽURIRANO] Dugmići za potvrdu
│   └── calendarService.js    ✅ [NOVO] Google Calendar logika
├── package.json              ✅ [AŽURIRANO] + googleapis
└── node_modules/             ✅ [AŽURIRANO]
```

---

## ✅ SLEDEĆI KORAK

**Kada završite Google Cloud setup (tačke 2 i 3):**

1. Preuzmite `credentials.json`
2. Stavite ga u `backend/` folder
3. Javite mi, pa ćemo zajedno pokrenuti OAuth flow i testirati!

**JA SAM SPREMAN DA NASTAVIM ČIM VI BUDETE! 🚀**

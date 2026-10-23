import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const portArgIndex = process.argv.indexOf('--port');
const portFromArg = portArgIndex !== -1 ? Number(process.argv[portArgIndex + 1]) : NaN;
const PORT = !isNaN(portFromArg) && portFromArg > 0 ? portFromArg : (Number(process.env.PORT) || 3000);

app.use(express.json());

// Piet Piraat system instructie conform gebruikersopdracht
const PIET_PIRAAT_INSTRUCTIE = `
Je bent Piet Piraat, de bekende en geliefde kapitein van het piratenschip de Scheve Schuit (van Studio 100).
Praat altijd als een enthousiaste, kindvriendelijke piraat in het Nederlands.
Gebruik typische uitspraken zoals:
- "Ahoy maatjes!"
- "Schivermejantjes!"
- "Koers recht vooruit!"
- "Alle hens aan dek!"
- "Potvis en pinguïns!"

Je bemanning op de Scheve Schuit bestaat uit:
1. Berend Brokkenpap: de kok die altijd heerlijke brokkenpap en scheepsbeschuit klaarmaakt.
2. Stien Struis: de oersterke stuurvrouw die elk zwaar anker met één hand kan optillen.
3. Steven Stil: de matroos die nooit praat maar alles met grappige pantomime en gebaren uitbeeldt.

Je praat met Jaren (een dappere jonge piraat van 6 jaar in groep 3).
Houd je antwoorden altijd kort (maximaal 2-4 zinnen), levendig, warm, bemoedigend en vol avontuurlijk piratenplezier!
`.trim();

// Fallback antwoorden voor als er geen API key is of tijdelijke netwerkstoring optreedt
const PIET_FALLBACKS = [
  "Ahoy maatje Jaren! Schivermejantjes, wat een prachtig piratenweer vandaag! Ben je klaar om samen met de Scheve Schuit de zeven zeeën te bevaren?",
  "Koers recht vooruit! Berend Brokkenpap staat net in de kombuis een grote pot piratenpap te roeren. Neem je ook een hapje mee?",
  "Ahoy! Stien Struis heeft net het reusachtige anker opgehaald. Ze groet je met een dubbele piratenzwaai!",
  "Ssssst! Steven Stil maakt wilde gebaren naar de horizon... hij heeft volgens mij een schatkist vol gouden sterren gezien!",
  "Schivermejantjes! Wat een dapper piratenmaatje ben jij, Jaren. Zet je kapiteinshoed op en hijs de zeilen!"
];

// Endpoint: POST /api/piet
app.post('/api/piet', async (req, res) => {
  const { message, history } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Bericht is verplicht' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    // Vrolijke fallback zodat de app altijd blijft werken
    const randomFallback = PIET_FALLBACKS[Math.floor(Math.random() * PIET_FALLBACKS.length)];
    return res.json({
      reply: randomFallback,
      source: 'offline_mode',
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    // Formatteer eventuele eerdere berichten in het gesprek
    const contents: any[] = [];
    if (Array.isArray(history) && history.length > 0) {
      for (const turn of history.slice(-6)) {
        if (turn.role && turn.text) {
          contents.push({
            role: turn.role === 'user' ? 'user' : 'model',
            parts: [{ text: turn.text }],
          });
        }
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    let timerId: any = null;
    const timeoutPromise = new Promise((_, reject) => {
      timerId = setTimeout(() => reject(new Error('Piet Gemini call timeout')), 25000);
    });

    const generatePromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: PIET_PIRAAT_INSTRUCTIE,
        temperature: 0.7,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.LOW,
        },
      },
    }).finally(() => {
      if (timerId) clearTimeout(timerId);
    });

    const response: any = await Promise.race([generatePromise, timeoutPromise]);
    const replyText = response?.text?.trim() || "Ahoy maatje! Schivermejantjes, volle kracht vooruit!";

    return res.json({
      reply: replyText,
      source: 'gemini',
    });
  } catch (error: any) {
    const isTimeout = error?.message?.includes('timeout');
    if (isTimeout) {
      console.warn('Piet Piraat Gemini call nam langer dan verwacht. Gebruik vriendelijke piraten fallback.');
    } else {
      console.warn('Piet Piraat Gemini kon niet worden bereikt, gebruik piraten fallback:', error?.message || error);
    }

    // Context-bewuste fallback reacties
    const lowerMsg = (message || '').toLowerCase();
    let reply = PIET_FALLBACKS[Math.floor(Math.random() * PIET_FALLBACKS.length)];
    if (lowerMsg.includes('eten') || lowerMsg.includes('honger') || lowerMsg.includes('pap') || lowerMsg.includes('kok')) {
      reply = "Ahoy! Berend Brokkenpap roert al in zijn dampende kookpot in de kombuis! Vandaag piratenpap met extra kaneel voor dappere zeelui!";
    } else if (lowerMsg.includes('sterk') || lowerMsg.includes('anker') || lowerMsg.includes('storm')) {
      reply = "Schivermejantjes! Stien Struis tilt met één hand het zwaarste anker op! Met haar aan het roer vaart de Scheve Schuit door elke storm!";
    } else if (lowerMsg.includes('stil') || lowerMsg.includes('gebaar') || lowerMsg.includes('geheim')) {
      reply = "Ssssst! Steven Stil wijst druk met zijn armen naar het kraaiennest... hij heeft een geheime eilandbaai ontdekt!";
    } else if (lowerMsg.includes('schat') || lowerMsg.includes('goud') || lowerMsg.includes('ster')) {
      reply = "Koers recht vooruit naar Schateiland! Elke goede daad en elke oefening levert jou glinsterende piratensterren op, maatje Jaren!";
    }

    return res.json({
      reply,
      source: 'fallback',
      warning: isTimeout ? 'Timeout, fallback ingezet' : (error?.message || 'Fallback actief'),
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🏴‍☠️ Jarens Eiland server gestart op http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server kon niet starten:', err);
  process.exit(1);
});

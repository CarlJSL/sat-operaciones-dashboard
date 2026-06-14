/**
 * AI-powered command matcher — multi-provider fallback.
 *
 * When the local pattern matcher fails, this service tries AI providers
 * in order: Groq first (free, no credit card, fast), then Gemini.
 * Returns a structured action or null.
 */
import type { AICmd } from '../types/voice.types';

// ---- Providers ----
const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY as string | undefined;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// ---- Throttle ----
let _lastAiCall = -Infinity;
const AI_COOLDOWN_MS = 10_000;

// ---- Shared prompt ----
const AVAILABLE_ROUTES = [
  '/inicio', '/consulta-en-linea', '/consulta-en-linea/papeletas',
  '/notificame/registro', '/notificame/confirmacion',
  '/login', '/usuarios', '/catalogo', '/roles',
];
const AVAILABLE_ACTIONS = [
  'pagar', 'reclamo', 'imprimir', 'descargar', 'buscar-otra', 'whatsapp', 'show-photo', 'close-photo',
];

const SYSTEM_PROMPT = `Sos un asistente virtual del SAT Perú. Tu trabajo es entender lo que dice un conductor peruano por voz y clasificar su INTENCIÓN en un JSON.

— CONTEXTO DE LA APP —
Es un dashboard del SAT donde la gente consulta sus papeletas (multas de tránsito). El usuario habla por micrófono y vos decidís qué acción tomar.

Rutas: ${AVAILABLE_ROUTES.join(', ')}
Acciones en página de papeletas: ${AVAILABLE_ACTIONS.join(', ')}

— FORMATO DE RESPUESTA (solo JSON, sin texto extra) —

NAVEGAR: {"action":"navigate","route":"/ruta","confidence":0.95}
BUSCAR:  {"action":"search","query":"155801","confidence":0.95}
CLICK:   {"action":"click","target":"pagar","confidence":0.95}
GLOBAL:  {"action":"global","command":"back","confidence":0.95}
NO ENTIENDO: {"action":"unknown","reason":"motivo","confidence":0.0}

— EJEMPLOS (aprendé de estos) —

"quisiera ver si tengo multas" → navigate a /consulta-en-linea/papeletas
"¿tengo alguna papeleta?" → navigate a /consulta-en-linea/papeletas
"como hago para pagar" → navigate a /consulta-en-linea/papeletas
"búscame la papeleta 155801" → search con query "155801"
"consultar placa A1G359" → search con query "A1G359"
"ver papeleta del DNI 12345678" → search con query "12345678"
"pagar la multa" → click target "pagar"
"hacer un reclamo" → click target "reclamo"
"imprimime la constancia" → click target "imprimir"
"descargar el expediente" → click target "descargar"
"quiero hablar con alguien" → click target "whatsapp"
"mostrame la foto de la infracción" → click target "show-photo"
"cerrame esa imagen" → click target "close-photo"
"volver atrás" → global command "back"
"llévame al inicio" → global command "home"
"quiero salir de mi cuenta" → global command "logout"
"no sé qué hacer, ayudame" → global command "help"
"ya no quiero hablar" → global command "stop"
"me quiero registrar para alertas" → navigate a /notificame/registro
"donde veo los usuarios" → navigate a /usuarios
"quiero ver el catálogo" → navigate a /catalogo
"chapa A1G359" → search con query "A1G359"
"tengo una multa" → navigate a /consulta-en-linea/papeletas
"debo algo al SAT" → navigate a /consulta-en-linea/papeletas

— REGLAS —
1. Respondé solo el JSON. Nada de markdown ni explicaciones.
2. Elegí la ruta más específica. Si habla de papeletas, usá /consulta-en-linea/papeletas, no /consulta-en-linea.
3. Confidence de 0.0 a 1.0. Solo ejecutamos >= 0.7.
4. Vocabulario peruano: papeleta=multa=infracción=parte, placa=chapa=matrícula, brevete=licencia, DNI=documento, pagar=cancelar=abonar, reclamo=apelación=queja=descargo, imprimir=sacar copia, chatear=hablar=whatsapp=contactar.
5. Si pide ayuda pero no queda claro qué, usá global help.
6. SOLO usá "search" si el usuario DICTA un número concreto (ej: "155801", "CP0015", "A1G-359"). Si dice frases como "quiero consultar" o "ver papeletas" sin número → navigate, NO search.
7. Si el usuario dice algo como "no", "nada", "mmm" → unknown.
8. Las frases con "por favor", "disculpe", "señor", "señorita", "joven" son de cortesía — ignorá las palabras de cortesía y clasificá la intención real.`;

// ---- Helpers ----

function parseResponse(text: string): AICmd | null {
  const clean = text.replace(/```(?:json)?\s*/g, '').replace(/```/g, '').trim();
  try {
    const result = JSON.parse(clean) as AICmd;
    if (result.action === 'unknown' || (result.confidence ?? 0) < 0.7) return null;
    return result;
  } catch {
    return null;
  }
}

async function tryGroq(transcript: string): Promise<AICmd | null> {
  if (!GROQ_KEY) return null;
  try {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: transcript },
        ],
        temperature: 0,
        max_tokens: 128,
      }),
    });
    if (!res.ok) {
      console.warn('[AI Matcher] Groq error:', res.status);
      return null;
    }
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;
    return text ? parseResponse(text) : null;
  } catch (err) {
    console.warn('[AI Matcher] Groq failed:', err);
    return null;
  }
}

async function tryGemini(transcript: string): Promise<AICmd | null> {
  if (!GEMINI_KEY) return null;
  try {
    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: transcript }] }],
        generationConfig: { temperature: 0, maxOutputTokens: 128 },
      }),
    });
    if (!res.ok) {
      console.warn('[AI Matcher] Gemini error:', res.status);
      return null;
    }
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text ? parseResponse(text) : null;
  } catch (err) {
    console.warn('[AI Matcher] Gemini failed:', err);
    return null;
  }
}

// ---- Public API ----

/**
 * Try AI providers in order: Groq → Gemini.
 * Returns null when all providers fail, are rate-limited, or no keys are set.
 */
export async function aiMatchCommand(transcript: string): Promise<AICmd | null> {
  const now = Date.now();
  if (now - _lastAiCall < AI_COOLDOWN_MS) return null;
  _lastAiCall = now;

  // Try Gemini first (user's primary provider)
  const geminiResult = await tryGemini(transcript);
  if (geminiResult) return geminiResult;

  // Fallback to Groq
  return tryGroq(transcript);
}

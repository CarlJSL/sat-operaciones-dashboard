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
  'pagar', 'reclamo', 'imprimir', 'descargar', 'buscar-otra', 'whatsapp',
];

const SYSTEM_PROMPT = `Eres un asistente del SAT Perú que entiende lenguaje natural de conductores peruanos.
Tu trabajo: clasificar la INTENCIÓN del mensaje de voz y devolver SOLO un JSON válido.

Contexto de la app:
- Es un dashboard donde conductores consultan sus papeletas (multas de tránsito).
- Rutas disponibles: ${AVAILABLE_ROUTES.join(', ')}
- Acciones disponibles en la página de papeletas: ${AVAILABLE_ACTIONS.join(', ')}

Responde ÚNICAMENTE con este JSON (nada de texto extra):

Para NAVEGAR a una ruta:
{"action":"navigate","route":"/ruta","confidence":0.9}

Para BUSCAR una papeleta:
{"action":"search","query":"texto a buscar","confidence":0.9}

Para hacer CLICK en un botón:
{"action":"click","target":"pagar|reclamo|imprimir|descargar|buscar-otra|whatsapp","confidence":0.9}

Para comandos GLOBALES:
{"action":"global","command":"back|home|logout|help|stop","confidence":0.9}

Si NO entendés:
{"action":"unknown","reason":"breve explicación","confidence":0.0}

REGLAS:
1. Solo devolvé JSON, sin markdown, sin explicaciones.
2. Elegí la ruta MÁS ESPECÍFICA posible.
3. Confidence >= 0.7 para ejecutar la acción.
4. Vocabulario peruano: papeleta=multa=infracción, placa=chapa, brevete=licencia, DNI=documento.
5. Si pide ayuda genérica, usá action:"global", command:"help".
6. SOLO usá "search" si el usuario DICTA un número, placa o DNI concreto (ej: "155801", "A1G359", "12345678"). Si dice "quiero consultar" o "ver papeletas" sin dar un número, usá "navigate" a /consulta-en-linea/papeletas.`;

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

import http from "node:http";
import { readFileSync, existsSync } from "node:fs";

function loadLocalEnv() {
  if (!existsSync(".env")) return;
  const raw = readFileSync(".env", "utf8");

  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Z][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]] !== undefined) continue;

    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    } else {
      value = value.replace(/\s+#.*$/, "").trim();
    }
    process.env[match[1]] = value;
  }
}

loadLocalEnv();

const PORT = Number(process.env.AI_SERVER_PORT || 3001);
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const MAX_BODY_BYTES = 2 * 1024 * 1024;

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(payload));
}

async function readJson(request) {
  const chunks = [];
  let size = 0;

  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      const error = new Error("Request too large. Please shorten your notes and try again.");
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
  } catch {
    const error = new Error("Request body must be valid JSON.");
    error.statusCode = 400;
    throw error;
  }
}

function extractGeminiText(data) {
  const candidates = Array.isArray(data.candidates) ? data.candidates : [];
  const parts = candidates[0]?.content?.parts || [];
  return parts
    .filter((part) => typeof part.text === "string")
    .map((part) => part.text)
    .join("\n")
    .trim();
}

async function handleHealth(response) {
  const configured = Boolean(process.env.GEMINI_API_KEY);
  return sendJson(response, configured ? 200 : 503, {
    ok: configured,
    provider: "Google Gemini",
    model: GEMINI_MODEL,
    message: configured
      ? "Gemini API key is loaded by the backend."
      : "GEMINI_API_KEY is missing. Add it to the local .env file and restart the backend.",
  });
}

async function handleGenerate(request, response) {
  let body;
  try {
    body = await readJson(request);
  } catch (error) {
    return sendJson(response, error.statusCode || 400, { error: error.message });
  }

  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  const systemInstruction =
    typeof body.systemInstruction === "string" ? body.systemInstruction.trim() : "";

  if (!prompt) {
    return sendJson(response, 400, { error: "Please enter notes or a question first." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return sendJson(response, 503, {
      error: "Gemini API key is missing. Add GEMINI_API_KEY to the project .env file and restart npm run ai:server.",
    });
  }

  const requestBody = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.35,
      maxOutputTokens: 8192,
    },
  };

  if (systemInstruction) {
    requestBody.systemInstruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  try {
    const geminiResponse = await fetch(
      `${GEMINI_BASE_URL}/${encodeURIComponent(GEMINI_MODEL)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(120000),
      }
    );

    const data = await geminiResponse.json().catch(() => ({}));

    if (!geminiResponse.ok) {
      const providerMessage =
        data?.error?.message ||
        data?.message ||
        `Gemini returned HTTP ${geminiResponse.status}.`;
      console.error("Gemini API error:", geminiResponse.status, providerMessage);
      return sendJson(response, geminiResponse.status, {
        error: providerMessage,
        provider: "Google Gemini",
        status: geminiResponse.status,
      });
    }

    const text = extractGeminiText(data);
    if (!text) {
      const finishReason = data?.candidates?.[0]?.finishReason || "unknown";
      console.error("Gemini returned no text. finishReason:", finishReason);
      return sendJson(response, 502, {
        error: `Gemini returned no text (finish reason: ${finishReason}). Try again or shorten the notes.`,
      });
    }

    return sendJson(response, 200, {
      text,
      model: data.modelVersion || GEMINI_MODEL,
    });
  } catch (error) {
    const timedOut = error.name === "TimeoutError" || error.name === "AbortError";
    console.error("Gemini connection error:", error);
    return sendJson(response, timedOut ? 504 : 502, {
      error: timedOut
        ? "Gemini took more than two minutes to respond. Try shorter notes and retry."
        : "Could not reach Google Gemini. Check your internet connection and try again.",
    });
  }
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);

  if (request.method === "GET" && url.pathname === "/api/health") {
    return handleHealth(response);
  }

  if (request.method === "POST" && url.pathname === "/api/generate") {
    return handleGenerate(request, response);
  }

  return sendJson(response, 404, { error: "API route not found." });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`AI backend running at http://127.0.0.1:${PORT}`);
  console.log(`Provider: Google Gemini | Model: ${GEMINI_MODEL}`);
  if (!process.env.GEMINI_API_KEY) {
    console.log("WARNING: GEMINI_API_KEY is missing. Create/update the local .env file.");
  }
});

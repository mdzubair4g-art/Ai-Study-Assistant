import http from "node:http";
import { readFileSync } from "node:fs";
import { existsSync } from "node:fs";

const PORT = Number(process.env.AI_SERVER_PORT || 3001);
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";
const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/interactions";
const MAX_BODY_BYTES = 2 * 1024 * 1024;

function loadLocalEnv() {
  const envPath = ".env";
  if (!existsSync(envPath)) return;

  const raw = readFileSync(envPath, "utf8");
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
      const error = new Error("Request is too large. Please shorten your notes and try again.");
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

function extractOutputText(data) {
  if (typeof data.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const pieces = [];
  for (const step of Array.isArray(data.steps) ? data.steps : []) {
    if (step.type !== "model_output" || !Array.isArray(step.content)) continue;
    for (const item of step.content) {
      if (item.type === "text" && typeof item.text === "string") {
        pieces.push(item.text);
      }
    }
  }
  return pieces.join("\n").trim();
}

async function handleHealth(response) {
  const configured = Boolean(process.env.GEMINI_API_KEY);
  return sendJson(response, configured ? 200 : 503, {
    ok: configured,
    provider: "Google Gemini",
    model: GEMINI_MODEL,
    message: configured
      ? "Gemini API key is configured. Send a test prompt to verify model access."
      : "GEMINI_API_KEY is missing. Add it to your local .env file and restart the AI server.",
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
    return sendJson(response, 400, { error: "Please provide notes or a question for Gemini." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return sendJson(response, 503, {
      error: "Gemini is not configured yet. Add GEMINI_API_KEY to your local .env file and restart the AI server.",
    });
  }

  try {
    const geminiResponse = await fetch(GEMINI_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      signal: AbortSignal.timeout(180000),
      body: JSON.stringify({
        model: GEMINI_MODEL,
        input: prompt,
        ...(systemInstruction ? { system_instruction: systemInstruction } : {}),
        store: false,
      }),
    });

    const data = await geminiResponse.json().catch(() => ({}));

    if (!geminiResponse.ok) {
      const message =
        data?.error?.message ||
        data?.message ||
        `Gemini returned HTTP ${geminiResponse.status}.`;
      return sendJson(response, geminiResponse.status, { error: message });
    }

    const text = extractOutputText(data);
    if (!text) {
      return sendJson(response, 502, {
        error: "Gemini returned no text. Please try again with a shorter prompt.",
      });
    }

    return sendJson(response, 200, { text, model: GEMINI_MODEL });
  } catch (error) {
    const timedOut = error.name === "TimeoutError" || error.name === "AbortError";
    return sendJson(response, timedOut ? 504 : 502, {
      error: timedOut
        ? "Gemini took too long to respond. Try shorter notes and retry."
        : "Could not reach the Gemini API. Check your internet connection and try again.",
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
    console.log("Missing GEMINI_API_KEY. Create a local .env file before making AI requests.");
  }
});

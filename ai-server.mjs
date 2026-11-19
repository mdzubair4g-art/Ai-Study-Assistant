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
const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const MAX_BODY_BYTES = 2 * 1024 * 1024;

function sendJson(response, status, payload, extraHeaders = {}) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...extraHeaders,
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

async function groqRequest(path, options = {}) {
  return fetch(`${GROQ_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
}

async function handleHealth(response) {
  if (!process.env.GROQ_API_KEY) {
    return sendJson(response, 503, {
      ok: false,
      provider: "Groq",
      model: GROQ_MODEL,
      message: "GROQ_API_KEY is missing. Add it to your local .env file and restart the backend.",
    });
  }

  try {
    const result = await groqRequest("/models", {
      method: "GET",
      signal: AbortSignal.timeout(8000),
    });
    const data = await result.json().catch(() => ({}));

    if (!result.ok) {
      return sendJson(response, result.status, {
        ok: false,
        provider: "Groq",
        model: GROQ_MODEL,
        message: data?.error?.message || "Groq could not verify this API key.",
      });
    }

    const models = Array.isArray(data.data) ? data.data : [];
    const modelAvailable = models.some((item) => item.id === GROQ_MODEL);

    return sendJson(response, modelAvailable ? 200 : 503, {
      ok: modelAvailable,
      provider: "Groq",
      model: GROQ_MODEL,
      message: modelAvailable
        ? "Groq API key and model are available."
        : `The API key works, but ${GROQ_MODEL} was not listed for this account. Check model access in Groq Console.`,
    });
  } catch {
    return sendJson(response, 503, {
      ok: false,
      provider: "Groq",
      model: GROQ_MODEL,
      message: "Could not reach Groq. Check your internet connection and try again.",
    });
  }
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
    return sendJson(response, 400, { error: "Please provide notes or a question for the AI." });
  }

  if (!process.env.GROQ_API_KEY) {
    return sendJson(response, 503, {
      error: "Groq is not configured. Add GROQ_API_KEY to the local .env file and restart npm run ai:server.",
    });
  }

  const messages = [];
  if (systemInstruction) messages.push({ role: "system", content: systemInstruction });
  messages.push({ role: "user", content: prompt });

  try {
    const result = await groqRequest("/chat/completions", {
      method: "POST",
      signal: AbortSignal.timeout(120000),
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        max_completion_tokens: 4096,
        reasoning_effort: "low",
        temperature: 0.4,
        stream: false,
      }),
    });

    const data = await result.json().catch(() => ({}));

    if (!result.ok) {
      const message = data?.error?.message || data?.message || `Groq returned HTTP ${result.status}.`;
      console.error("Groq API error:", result.status, message);
      const headers = {};
      const retryAfter = result.headers.get("retry-after");
      if (retryAfter) headers["Retry-After"] = retryAfter;
      return sendJson(response, result.status, { error: message }, headers);
    }

    const text = data?.choices?.[0]?.message?.content;
    if (typeof text !== "string" || !text.trim()) {
      console.error("Groq returned no text:", JSON.stringify({
        finish_reason: data?.choices?.[0]?.finish_reason,
        model: data?.model,
      }));
      return sendJson(response, 502, {
        error: "Groq returned an empty response. Please retry with shorter notes.",
      });
    }

    return sendJson(response, 200, {
      text: text.trim(),
      model: data.model || GROQ_MODEL,
    });
  } catch (error) {
    const timedOut = error.name === "TimeoutError" || error.name === "AbortError";
    console.error("Groq connection error:", error.message);
    return sendJson(response, timedOut ? 504 : 502, {
      error: timedOut
        ? "Groq took too long to respond. Try shorter notes and retry."
        : "Could not reach Groq. Check your internet connection and try again.",
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
  console.log(`Provider: Groq | Model: ${GROQ_MODEL}`);
  if (!process.env.GROQ_API_KEY) {
    console.log("WARNING: GROQ_API_KEY is missing. Create/update the local .env file.");
  }
});

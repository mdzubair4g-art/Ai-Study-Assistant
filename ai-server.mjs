import http from "node:http";

const PORT = Number(process.env.AI_SERVER_PORT || 3001);
const OLLAMA_BASE_URL = (process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434").replace(/\/$/, "");
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen3:0.6b";
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
      const error = new Error("Request is too large. Please shorten the notes and try again.");
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

async function handleHealth(response) {
  try {
    const ollamaResponse = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      signal: AbortSignal.timeout(5000),
    });

    if (!ollamaResponse.ok) {
      return sendJson(response, 503, {
        ok: false,
        model: OLLAMA_MODEL,
        message: "Ollama is running but did not return its model list.",
      });
    }

    const data = await ollamaResponse.json();
    const models = Array.isArray(data.models) ? data.models : [];
    const installed = models.some((item) =>
      [item.name, item.model].some((name) => name === OLLAMA_MODEL || name?.startsWith(`${OLLAMA_MODEL}:`))
    );

    return sendJson(response, installed ? 200 : 503, {
      ok: installed,
      provider: "Ollama",
      model: OLLAMA_MODEL,
      installedModels: models.map((item) => item.name || item.model).filter(Boolean),
      message: installed
        ? "AI model is ready."
        : `Model ${OLLAMA_MODEL} is not installed. Run: ollama pull ${OLLAMA_MODEL}`,
    });
  } catch {
    return sendJson(response, 503, {
      ok: false,
      provider: "Ollama",
      model: OLLAMA_MODEL,
      message: "Cannot reach Ollama. Start Ollama and make sure it is listening on 127.0.0.1:11434.",
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

  try {
    const ollamaResponse = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(180000),
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        ...(systemInstruction ? { system: systemInstruction } : {}),
        stream: false,
        keep_alive: "5m",
      }),
    });

    const data = await ollamaResponse.json().catch(() => ({}));

    if (!ollamaResponse.ok) {
      const message = data.error || `Ollama returned HTTP ${ollamaResponse.status}.`;
      return sendJson(response, ollamaResponse.status, { error: message });
    }

    const text = typeof data.response === "string" ? data.response.trim() : "";
    if (!text) {
      return sendJson(response, 502, { error: "The AI model returned an empty response. Please try again." });
    }

    return sendJson(response, 200, { text, model: OLLAMA_MODEL });
  } catch (error) {
    const isTimeout = error.name === "TimeoutError" || error.name === "AbortError";
    return sendJson(response, isTimeout ? 504 : 503, {
      error: isTimeout
        ? "The AI took too long to respond. Try shorter notes or try again."
        : "Cannot connect to Ollama. Start Ollama and check that the selected model is installed.",
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
  console.log(`Provider: Ollama | Model: ${OLLAMA_MODEL}`);
});

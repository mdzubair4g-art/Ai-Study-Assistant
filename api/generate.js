const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "openai/gpt-oss-120b";
const MAX_PROMPT_CHARS = 50000;
const MAX_SYSTEM_CHARS = 5000;

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: "AI is not configured yet. Add GROQ_API_KEY in the Vercel project environment variables.",
    });
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
  } catch {
    return res.status(400).json({ error: "Request body must be valid JSON." });
  }

  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  const systemInstruction =
    typeof body.systemInstruction === "string" ? body.systemInstruction.trim() : "";

  if (!prompt) {
    return res.status(400).json({ error: "Please provide notes or a question for the AI." });
  }

  if (prompt.length > MAX_PROMPT_CHARS) {
    return res.status(413).json({ error: "Your text is too long. Please shorten it and try again." });
  }

  const model = process.env.GROQ_MODEL || DEFAULT_MODEL;
  const messages = [];

  if (systemInstruction) {
    messages.push({
      role: "system",
      content: systemInstruction.slice(0, MAX_SYSTEM_CHARS),
    });
  }

  messages.push({ role: "user", content: prompt });

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      signal: AbortSignal.timeout(55000),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        max_completion_tokens: 4096,
        reasoning_effort: "low",
        temperature: 0.4,
        stream: false,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const providerMessage =
        data?.error?.message || data?.message || `Groq returned HTTP ${response.status}.`;
      console.error("Groq API error:", response.status, providerMessage);

      if (response.status === 401 || response.status === 403) {
        return res.status(503).json({
          error: "Groq rejected the API key. Check GROQ_API_KEY in Vercel settings.",
        });
      }

      if (response.status === 429) {
        return res.status(429).json({
          error: "Groq is rate-limiting requests. Please wait a moment and try again.",
        });
      }

      return res.status(response.status >= 500 ? 502 : response.status).json({
        error: "The AI provider could not complete this request. Please try again.",
      });
    }

    const text = data?.choices?.[0]?.message?.content;
    if (typeof text !== "string" || !text.trim()) {
      console.error("Groq returned an empty response for model:", model);
      return res.status(502).json({
        error: "The AI returned an empty response. Please retry with shorter notes.",
      });
    }

    return res.status(200).json({
      text: text.trim(),
      response: text.trim(),
      model: data.model || model,
    });
  } catch (error) {
    console.error("Groq connection error:", error.message);
    const timedOut = error.name === "TimeoutError" || error.name === "AbortError";
    return res.status(timedOut ? 504 : 502).json({
      error: timedOut
        ? "The AI took too long to respond. Try shorter notes and retry."
        : "Could not reach the AI provider. Please try again.",
    });
  }
}


const MODELS = [
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-3.5-flash-lite"
];

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "Gemini API key is missing."
    });
  }

  try {
    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body || {};

    const { prompt, systemInstruction } = body;

    if (
      typeof prompt !== "string" ||
      !prompt.trim()
    ) {
      return res.status(400).json({
        error: "Please provide a prompt."
      });
    }

    if (prompt.length > 50000) {
      return res.status(413).json({
        error: "Your text is too long."
      });
    }

    let lastError = "";

    for (const model of MODELS) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: prompt.trim() }]
              }
            ],
            ...(systemInstruction
              ? {
                  systemInstruction: {
                    parts: [
                      {
                        text: String(systemInstruction).slice(0, 5000)
                      }
                    ]
                  }
                }
              : {}),
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2500
            }
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        const text = data.candidates?.[0]?.content?.parts
          ?.map((part) => part.text || "")
          .join("\n")
          .trim();

        if (text) {
          return res.status(200).json({
            text,
            model
          });
        }

        lastError = "The AI returned an empty response.";
        continue;
      }

      lastError =
        data.error?.message || "Gemini request failed.";

      console.error(`${model}:`, lastError);

      if (
        response.status === 503 ||
        response.status === 500 ||
        response.status === 404
      ) {
        await sleep(1000);
        continue;
      }

      return res.status(response.status).json({
        error: lastError
      });
    }

    return res.status(503).json({
      error:
        "All available Gemini models are busy. Please try again shortly.",
      details: lastError
    });

  } catch (error) {
    console.error("Backend error:", error.message);

    return res.status(500).json({
      error: "AI server error."
    });
  }
}

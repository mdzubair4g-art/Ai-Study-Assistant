
const originalFetch = window.fetch.bind(window);

window.fetch = async function (input, init = {}) {
  const url =
    input instanceof Request ? input.url : String(input);

  let parsedUrl;

  try {
    parsedUrl = new URL(url, window.location.origin);
  } catch {
    return originalFetch(input, init);
  }

  const isOllama =
    ["localhost", "127.0.0.1"].includes(parsedUrl.hostname) &&
    parsedUrl.port === "11434";

  const isGenerate = parsedUrl.pathname.endsWith("/api/generate");
  const isChat = parsedUrl.pathname.endsWith("/api/chat");

  if (!isOllama || (!isGenerate && !isChat)) {
    return originalFetch(input, init);
  }

  try {
    let rawBody = init.body;

    if (
      rawBody === undefined &&
      input instanceof Request
    ) {
      rawBody = await input.clone().text();
    }

    const body =
      typeof rawBody === "string"
        ? JSON.parse(rawBody)
        : rawBody || {};

    let prompt = "";
    let systemInstruction = body.system || "";

    if (isChat && Array.isArray(body.messages)) {
      const messages = body.messages;

      const systemMessages = messages
        .filter((message) => message.role === "system")
        .map((message) => message.content)
        .filter((content) => typeof content === "string");

      if (systemMessages.length) {
        systemInstruction = systemMessages.join("\n");
      }

      prompt = messages
        .filter((message) => message.role !== "system")
        .map((message) => {
          const role = message.role || "user";
          const content =
            typeof message.content === "string"
              ? message.content
              : "";

          return `${role}: ${content}`;
        })
        .join("\n\n");
    } else {
      prompt = body.prompt || "";
    }

    if (!prompt.trim()) {
      throw new Error("No prompt was provided.");
    }

    const response = await originalFetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt,
        systemInstruction
      }),
      signal:
        init.signal ||
        (input instanceof Request ? input.signal : undefined)
    });

    const data = await response.json();

    if (!response.ok) {
      const errorResult = {
        error: data.error || "AI request failed.",
        response: "",
        message: {
          role: "assistant",
          content: ""
        },
        done: true
      };

      return new Response(JSON.stringify(errorResult), {
        status: response.status,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }

    const result = isChat
      ? {
          message: {
            role: "assistant",
            content: data.text
          },
          done: true
        }
      : {
          response: data.text,
          done: true
        };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });

  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message || "Online AI connection failed.",
        response: "",
        message: {
          role: "assistant",
          content: ""
        },
        done: true
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
};

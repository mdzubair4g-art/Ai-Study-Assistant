
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

const LANGUAGES = [
  { name: "English", code: "en-US" },
  { name: "Hindi", code: "hi-IN" },
  { name: "Kannada", code: "kn-IN" },
  { name: "Tamil", code: "ta-IN" },
  { name: "Telugu", code: "te-IN" },
  { name: "Malayalam", code: "ml-IN" },
  { name: "Urdu", code: "ur-PK" },
  { name: "Bengali", code: "bn-IN" },
  { name: "Marathi", code: "mr-IN" },
  { name: "Spanish", code: "es-ES" },
  { name: "French", code: "fr-FR" },
  { name: "German", code: "de-DE" },
];

const MODEL = "openai/gpt-oss-120b";
const OLLAMA_URL = "http://127.0.0.1:11434/api/generate";

function Podcast() {
  const [notes, setNotes] = useState("");
  const [podcast, setPodcast] = useState("");
  const [language, setLanguage] = useState("en-US");
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [playback, setPlayback] = useState("stopped");

  useEffect(() => {
    if (!window.speechSynthesis) return;

    const loadVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const currentLanguage =
    LANGUAGES.find((item) => item.code === language) || LANGUAGES[0];

  const matchingVoices = voices.filter((voice) =>
    voice.lang.toLowerCase().startsWith(language.split("-")[0].toLowerCase())
  );

  useEffect(() => {
    if (matchingVoices.length > 0) {
      setSelectedVoice(matchingVoices[0].voiceURI);
    } else {
      setSelectedVoice("");
    }
  }, [language, voices]);

  const stopAudio = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setPlayback("stopped");
  };

  const generateWithAI = async (prompt) => {
    const response = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        prompt,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 1000,
        },
      }),
    });

    if (!response.ok) {
      throw new Error("AI request failed. Check the Groq backend and API key.");
    }

    const data = await response.json();

    if (!data.response) {
      throw new Error("AI returned an empty response.");
    }

    return data.response.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
  };

  const generatePodcast = async () => {
    if (!notes.trim()) {
      setMessage("Please paste your study notes first.");
      return;
    }

    setLoading(true);
    setMessage("");
    setPodcast("");
    stopAudio();

    const prompt = `
You are a professional educational podcast writer.

Convert the following study notes into an engaging conversation between two speakers: HOST and CO-HOST.

Requirements:
1. Write entirely in ${currentLanguage.name}.
2. Use the correct writing script for this language.
3. Explain difficult concepts in simple language.
4. Include a friendly introduction.
5. Explain all important concepts accurately.
6. Include useful examples where appropriate.
7. End with a short recap.
8. Preserve the meaning of the original notes.
9. Do not invent facts.
10. Return only the podcast conversation.

STUDY NOTES:
${notes}
`;

    try {
      const result = await generateWithAI(prompt);
      setPodcast(result);
      setMessage("Your podcast has been generated successfully!");
    } catch (error) {
      setMessage(
        "Could not connect to Groq. Make sure the backend is running and GROQ_API_KEY is configured. " +
          error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const translatePodcast = async () => {
    if (!podcast.trim()) {
      setMessage("Generate a podcast before translating.");
      return;
    }

    setLoading(true);
    setMessage("");
    stopAudio();

    const prompt = `
Translate the following educational podcast conversation into ${currentLanguage.name}.

Requirements:
1. Preserve the original meaning.
2. Keep HOST and CO-HOST speaker labels.
3. Use natural conversational language.
4. Use the correct writing script.
5. Do not add unrelated information.
6. Return only the translated podcast.

PODCAST:
${podcast}
`;

    try {
      const result = await generateWithAI(prompt);
      setPodcast(result);
      setMessage("Podcast translated successfully!");
    } catch (error) {
      setMessage("Translation failed. Check the Groq backend. " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const playPodcast = () => {
    if (!podcast.trim()) {
      setMessage("Generate a podcast first.");
      return;
    }

    if (!window.speechSynthesis) {
      setMessage("Your browser does not support speech playback.");
      return;
    }

    if (matchingVoices.length === 0) {
      setMessage(
        "No voice is installed for " +
          currentLanguage.name +
          ". Install a compatible voice in Windows settings."
      );
      return;
    }

    stopAudio();

    const utterance = new SpeechSynthesisUtterance(podcast);
    utterance.lang = language;
    utterance.rate = 0.95;
    utterance.pitch = 1;

    const voice = voices.find((item) => item.voiceURI === selectedVoice);

    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => setPlayback("playing");
    utterance.onend = () => setPlayback("stopped");

    utterance.onerror = () => {
      setPlayback("stopped");
      setMessage("Audio playback could not be completed.");
    };

    window.speechSynthesis.speak(utterance);
  };

  const pausePodcast = () => {
    window.speechSynthesis.pause();
    setPlayback("paused");
  };

  const resumePodcast = () => {
    window.speechSynthesis.resume();
    setPlayback("playing");
  };

  const clearAll = () => {
    stopAudio();
    setNotes("");
    setPodcast("");
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🎙️</div>

          <h1 className="text-4xl font-bold text-gray-900">
            AI Podcast Listener
          </h1>

          <p className="text-gray-600 mt-3">
            Transform your study notes into multilingual podcasts and learn by
            listening.
          </p>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Your Study Notes 📝
            </h2>

            <span className="text-sm text-gray-500">
              {notes.length} characters
            </span>
          </div>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Paste your college notes here..."
            className="w-full h-56 border border-gray-300 rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          />

          <div className="mt-6">
            <label className="block font-semibold mb-2">
              Choose Podcast Language 🌍
            </label>

            <select
              value={language}
              onChange={(e) => {
                stopAudio();
                setLanguage(e.target.value);
              }}
              className="w-full border border-gray-300 rounded-lg p-3 bg-white outline-none focus:ring-2 focus:ring-blue-500"
            >
              {LANGUAGES.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              onClick={generatePodcast}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? "🤖 Creating Podcast..." : "🎙️ Generate Podcast"}
            </button>

            <button
              onClick={clearAll}
              className="px-6 py-3 border border-gray-300 rounded-xl font-semibold hover:bg-gray-100"
            >
              Clear
            </button>
          </div>

          {message && (
            <p className="mt-5 text-sm text-blue-700 bg-blue-50 p-4 rounded-lg">
              {message}
            </p>
          )}
        </div>

        {podcast && (
          <div className="bg-white p-6 md:p-8 mt-8 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold mb-2">🎧 Your Podcast</h2>

            <p className="text-gray-500 text-sm mb-6">
              Language: {currentLanguage.name}
            </p>

            <div className="bg-blue-50 rounded-xl p-5 md:p-6 mb-6">
              <p className="whitespace-pre-wrap leading-8 text-gray-800">
                {podcast}
              </p>
            </div>

            <div className="mb-6">
              <label className="block font-semibold mb-2">
                Select Available Voice
              </label>

              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                disabled={matchingVoices.length === 0}
                className="w-full border border-gray-300 rounded-lg p-3 bg-white disabled:bg-gray-100"
              >
                {matchingVoices.length === 0 ? (
                  <option value="">No matching voice installed</option>
                ) : (
                  matchingVoices.map((voice) => (
                    <option key={voice.voiceURI} value={voice.voiceURI}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))
                )}
              </select>

              {matchingVoices.length === 0 && (
                <p className="text-sm text-orange-600 mt-2">
                  This language may need an additional Windows speech voice.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={playPodcast}
                disabled={loading}
                className="bg-blue-600 text-white p-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                ▶ Play
              </button>

              <button
                onClick={pausePodcast}
                className="bg-gray-800 text-white p-3 rounded-xl font-semibold hover:bg-gray-900"
              >
                ⏸ Pause
              </button>

              <button
                onClick={resumePodcast}
                className="bg-green-600 text-white p-3 rounded-xl font-semibold hover:bg-green-700"
              >
                ▶ Resume
              </button>

              <button
                onClick={stopAudio}
                className="bg-red-600 text-white p-3 rounded-xl font-semibold hover:bg-red-700"
              >
                ⏹ Stop
              </button>
            </div>

            <button
              onClick={translatePodcast}
              disabled={loading}
              className="w-full mt-5 border-2 border-blue-600 text-blue-700 py-3 rounded-xl font-semibold hover:bg-blue-50 disabled:opacity-50"
            >
              🌍 Translate Podcast into {currentLanguage.name}
            </button>

            <p className="text-xs text-gray-500 mt-4 text-center">
              Playback uses speech voices available on your device.
            </p>

            <p className="text-xs text-gray-500 text-center">
              Playback status: {playback}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default Podcast;

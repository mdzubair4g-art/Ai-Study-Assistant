const STUDY_SOURCE_KEY = "ai-notes-simplifier-shared-study-source";

export function readStudySource() {
  if (typeof window === "undefined") return "";

  try {
    return window.localStorage.getItem(STUDY_SOURCE_KEY) || "";
  } catch {
    return "";
  }
}

export function saveStudySource(value) {
  if (typeof window === "undefined") return;

  try {
    const source = typeof value === "string" ? value : "";
    if (source.trim()) {
      window.localStorage.setItem(STUDY_SOURCE_KEY, source);
    } else {
      window.localStorage.removeItem(STUDY_SOURCE_KEY);
    }
  } catch {
    // The study tool remains usable when browser storage is unavailable.
  }
}

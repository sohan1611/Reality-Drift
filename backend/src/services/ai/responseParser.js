exports.parseJsonSafely = (text) => {
  if (!text) return null;
  text = text.trim();

  // Try standard parse first
  try {
    return JSON.parse(text);
  } catch (e) {}

  // Try stripping markdown blocks
  try {
    let cleaned = text.replace(/^```(json)?/i, "").replace(/```$/i, "").trim();
    return JSON.parse(cleaned);
  } catch (e) {}

  // Robust extraction: Find first { and last }
  try {
    const startObj = text.indexOf('{');
    const endObj = text.lastIndexOf('}');
    if (startObj !== -1 && endObj !== -1 && endObj > startObj) {
      const extracted = text.substring(startObj, endObj + 1);
      return JSON.parse(extracted);
    }
  } catch (e) {
    console.error("JSON Extractor failed completely on:", text);
  }

  // Same for arrays
  try {
    const startArr = text.indexOf('[');
    const endArr = text.lastIndexOf(']');
    if (startArr !== -1 && endArr !== -1 && endArr > startArr) {
      const extracted = text.substring(startArr, endArr + 1);
      return JSON.parse(extracted);
    }
  } catch (e) {
    console.error("Array JSON Extractor failed completely on:", text);
  }

  return null;
};

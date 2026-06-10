import { useState, useEffect } from 'react';
import Sanscript from '@indic-transliteration/sanscript';

export function useTransliterate(text: string | undefined, sourceScript: string, targetScript: string) {
  const [transliteratedText, setTransliteratedText] = useState(text || '');

  useEffect(() => {
    if (!text) {
      setTransliteratedText('');
      return;
    }

    // Only transliterate if scripts differ and aren't IAST to IAST
    if (sourceScript === targetScript || targetScript === 'iast') {
      setTransliteratedText(text);
      return;
    }

    try {
      const result = Sanscript.t(text, sourceScript, targetScript);
      setTransliteratedText(result);
    } catch (e) {
      console.error("Transliteration error:", e);
      setTransliteratedText(text); // fallback to original on error
    }
  }, [text, sourceScript, targetScript]);

  return transliteratedText;
}
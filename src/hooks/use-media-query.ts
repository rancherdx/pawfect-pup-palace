
import { useState, useEffect } from "react";

/**
 * @hook useMediaQuery
 * @description A custom React hook that listens for changes in a CSS media query.
 * @param {string} query - The media query string to match (e.g., '(max-width: 768px)').
 * @returns {boolean} `true` if the media query matches, otherwise `false`.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
}

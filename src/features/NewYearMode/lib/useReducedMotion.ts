import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

export const useReducedMotion = (): boolean => {
  const [isReduced, setIsReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia(QUERY).matches,
  );

  useEffect(() => {
    const media = window.matchMedia(QUERY);
    const handleChange = () => setIsReduced(media.matches);
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  return isReduced;
};

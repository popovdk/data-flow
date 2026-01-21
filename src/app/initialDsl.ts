import { decodeDslFromHash, loadFromStorage } from "../shared/persistence";

export const loadInitialDsl = async (fallback: string): Promise<string> => {
  const hashValue = await decodeDslFromHash(window.location.hash);
  const stored = loadFromStorage();
  return hashValue ?? stored ?? fallback;
};

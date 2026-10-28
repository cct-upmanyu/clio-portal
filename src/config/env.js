const trimTrailingSlash = (value) => value.replace(/\/+$/, "");

export const env = {
  apiUrl: trimTrailingSlash(import.meta.env.VITE_API_BASE_URL || ""),
};

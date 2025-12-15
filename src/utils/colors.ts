const getColor = (envKey: string, fallback: string): string => {
  const value = process.env[envKey];
  return typeof value === "string" && value.length > 0 ? value : fallback;
};

export const COLOR_PRIMARY = getColor("EXPO_PUBLIC_COLOR_PRIMARY", "#477b78");
export const COLOR_ACCENT = getColor("EXPO_PUBLIC_COLOR_ACCENT", "#e5a754");
export const COLOR_ACCENT_SOFT = getColor(
  "EXPO_PUBLIC_COLOR_ACCENT_SOFT",
  "#e2bd8f"
);
export const COLOR_MUTED = getColor("EXPO_PUBLIC_COLOR_MUTED", "#9ca48d");
export const COLOR_DARK = getColor("EXPO_PUBLIC_COLOR_DARK", "#4f4b42");



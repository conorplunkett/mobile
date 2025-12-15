export const RATING_SCALE = [
  { rating: 1, emoji: "🤨", label: "Not for me" },
  { rating: 2, emoji: "😐", label: "Somewhat resonated" },
  { rating: 3, emoji: "😊", label: "Resonated" },
  { rating: 4, emoji: "😄", label: "Strongly resonated" },
  { rating: 5, emoji: "🤩", label: "Deeply resonated" },
];

export const RATING_EMOJI_BY_SCORE = RATING_SCALE.reduce((acc, item) => {
  acc[item.rating] = item.emoji;
  return acc;
}, {});

export const RATING_LABEL_BY_SCORE = RATING_SCALE.reduce((acc, item) => {
  acc[item.rating] = item.label;
  return acc;
}, {});

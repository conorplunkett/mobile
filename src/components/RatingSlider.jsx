import {
  View,
  Text,
  useColorScheme,
  Animated,
  Pressable,
} from "react-native";
import { useRef, useState, useEffect } from "react";
import * as Haptics from "expo-haptics";
import { useFonts, Inter_600SemiBold } from "@expo-google-fonts/inter";

const EMOJI_RATINGS = [
  { emoji: "🤨", rating: 1, label: "Not for me" },
  { emoji: "😐", rating: 2, label: "Somewhat resonated" },
  { emoji: "😊", rating: 3, label: "Resonated" },
  { emoji: "😄", rating: 4, label: "Strongly resonated" },
  { emoji: "🤩", rating: 5, label: "Deeply resonated" },
];

export default function RatingSlider({ onRatingChange, initialRating = null }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [rating, setRating] = useState(initialRating);
  const scaleAnimations = useRef(
    EMOJI_RATINGS.map(() => new Animated.Value(1))
  ).current;

  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
  });

  useEffect(() => {
    // Sync rating when initialRating changes externally
    setRating(initialRating);
  }, [initialRating]);

  const handleEmojiPress = (selectedRating) => {
    // Trigger haptics
    if (selectedRating >= 4) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else if (selectedRating >= 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Animate scale for the selected emoji
    const emojiIndex = selectedRating - 1;
    
    // Reset all animations first
    scaleAnimations.forEach((anim) => anim.setValue(1));
    
    // Animate the selected emoji
    Animated.sequence([
      Animated.timing(scaleAnimations[emojiIndex], {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimations[emojiIndex], {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    setRating(selectedRating);
    onRatingChange(selectedRating);
  };

  if (!fontsLoaded) {
    return null;
  }

  const containerWidth = 300;

  return (
    <View style={{ paddingVertical: 40, alignItems: "center" }}>
      <View
        style={{
          backgroundColor: isDark ? "#1E1E1E" : "#F6F7F9",
          borderRadius: 20,
          padding: 24,
          width: containerWidth + 48,
        }}
      >
        {/* Number line */}
        <View style={{ marginBottom: 24 }}>
          {/* Number markers above */}
          <View
            style={{
              flexDirection: "row",
              marginBottom: 12,
              position: "relative",
            }}
          >
            {[1, 2, 3, 4, 5].map((num) => (
              <View
                key={num}
                style={{
                  flex: 1,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 14,
                    color:
                      rating === num
                        ? "#477b78"
                        : isDark
                          ? "#6B7280"
                          : "#9CA3AF",
                  }}
                >
                  {num}
                </Text>
              </View>
            ))}
          </View>

          {/* Track background with distinct segments */}
          <View
            style={{
              height: 8,
              borderRadius: 4,
              flexDirection: "row",
              overflow: "hidden",
            }}
          >
            {[1, 2, 3, 4, 5].map((num) => {
              const isFilled = rating !== null && num <= rating;
              return (
                <View
                  key={num}
                  style={{
                    flex: 1,
                    height: 8,
                    backgroundColor: isFilled ? "#e5a754" : (isDark ? "#2A2A2A" : "#E5E7EB"),
                    borderRightWidth: num < 5 ? 1 : 0,
                    borderRightColor: isDark ? "#1E1E1E" : "#FFFFFF",
                  }}
                />
              );
            })}
          </View>
        </View>

        {/* Emoji buttons */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          {EMOJI_RATINGS.map((item, index) => {
            const isSelected = rating === item.rating;
            return (
              <Pressable
                key={item.rating}
                onPress={() => handleEmojiPress(item.rating)}
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Animated.View
                  style={{
                    transform: [{ scale: scaleAnimations[index] }],
                  }}
                >
                  <Text
                    style={{
                      fontSize: isSelected ? 48 : 40,
                      opacity: isSelected ? 1 : 0.6,
                    }}
                  >
                    {item.emoji}
                  </Text>
                </Animated.View>
              </Pressable>
            );
          })}
        </View>

        {/* Selected label */}
        {rating !== null && (
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 18,
              color: "#477b78",
              textAlign: "center",
              width: "100%",
            }}
          >
            {EMOJI_RATINGS.find((item) => item.rating === rating)?.label}
          </Text>
        )}
      </View>
    </View>
  );
}

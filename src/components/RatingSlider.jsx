import {
  View,
  Text,
  useColorScheme,
  Animated,
  PanResponder,
} from "react-native";
import { useRef, useState, useEffect } from "react";
import * as Haptics from "expo-haptics";
import { useFonts, Inter_600SemiBold } from "@expo-google-fonts/inter";

export default function RatingSlider({ onRatingChange, initialRating = 3 }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [rating, setRating] = useState(initialRating);

  const sliderWidth = 300;
  const initialPosition = ((initialRating - 1) / 4) * sliderWidth;
  const position = useRef(new Animated.Value(initialPosition)).current;
  const sparkLeft = useRef(new Animated.Value(0)).current;
  const sparkRight = useRef(new Animated.Value(0)).current;
  const currentPosition = useRef(initialPosition);

  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
  });

  useEffect(() => {
    // Sync currentPosition when initialRating changes externally
    const newPosition = ((initialRating - 1) / 4) * sliderWidth;
    currentPosition.current = newPosition;
    position.setValue(newPosition);
  }, [initialRating]);

  useEffect(() => {
    // Animate sparks from sides based on rating (more sparks for higher ratings)
    const sparkIntensity = rating >= 4 ? 1 : rating >= 3 ? 0.5 : 0;

    Animated.parallel([
      Animated.timing(sparkLeft, {
        toValue: sparkIntensity,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(sparkRight, {
        toValue: sparkIntensity,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Trigger haptics based on rating
    if (rating >= 4) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else if (rating >= 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [rating]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, gestureState) => {
        // Use the touch location relative to the track
        const locationX = evt.nativeEvent.locationX;
        const newPosition = Math.max(0, Math.min(sliderWidth, locationX));
        currentPosition.current = newPosition;
        updateRating(newPosition);
      },
      onPanResponderMove: (evt, gestureState) => {
        // Calculate new position based on current position + delta movement
        const newPosition = currentPosition.current + gestureState.dx;
        updateRating(newPosition);
      },
    }),
  ).current;

  const updateRating = (x) => {
    const clampedX = Math.max(0, Math.min(sliderWidth, x));
    currentPosition.current = clampedX;
    const newRating = Math.round((clampedX / sliderWidth) * 4) + 1;

    if (newRating !== rating) {
      setRating(newRating);
      onRatingChange(newRating);
    }

    position.setValue(clampedX);
  };

  if (!fontsLoaded) {
    return null;
  }

  const sparkLeftOpacity = sparkLeft.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.8],
  });

  const sparkLeftTranslate = sparkLeft.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, 0],
  });

  const sparkRightOpacity = sparkRight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.8],
  });

  const sparkRightTranslate = sparkRight.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0],
  });

  return (
    <View style={{ paddingVertical: 40, alignItems: "center" }}>
      {/* Left spark effect */}
      <Animated.View
        style={{
          position: "absolute",
          left: 0,
          top: "50%",
          opacity: sparkLeftOpacity,
          transform: [{ translateX: sparkLeftTranslate }, { translateY: -25 }],
        }}
        pointerEvents="none"
      >
        <Text style={{ fontSize: 50 }}>✨</Text>
      </Animated.View>

      {/* Right spark effect */}
      <Animated.View
        style={{
          position: "absolute",
          right: 0,
          top: "50%",
          opacity: sparkRightOpacity,
          transform: [{ translateX: sparkRightTranslate }, { translateY: -25 }],
        }}
        pointerEvents="none"
      >
        <Text style={{ fontSize: 50 }}>✨</Text>
      </Animated.View>

      <View
        style={{
          backgroundColor: isDark ? "#1E1E1E" : "#F6F7F9",
          borderRadius: 20,
          padding: 24,
          width: sliderWidth + 48,
        }}
      >
        {/* Number line */}
        <View style={{ marginBottom: 20 }}>
          <View
            style={{
              height: 60,
              justifyContent: "center",
            }}
            {...panResponder.panHandlers}
          >
            {/* Track */}
            <View
              style={{
                height: 4,
                backgroundColor: isDark ? "#2A2A2A" : "#E5E7EB",
                borderRadius: 2,
              }}
            />

            {/* Active track */}
            <View
              style={{
                position: "absolute",
                left: 0,
                height: 4,
                width: `${((rating - 1) / 4) * 100}%`,
                backgroundColor: "#477b78",
                borderRadius: 2,
              }}
            />

            {/* Number markers */}
            <View
              style={{
                position: "absolute",
                width: "100%",
                flexDirection: "row",
                justifyContent: "space-between",
                top: -20,
              }}
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <Text
                  key={num}
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
              ))}
            </View>

            {/* Draggable thumb */}
            <Animated.View
              style={{
                position: "absolute",
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: "#477b78",
                borderWidth: 4,
                borderColor: "#FFFFFF",
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
                elevation: 4,
                transform: [{ translateX: position }, { translateX: -16 }],
              }}
            />
          </View>
        </View>

        {/* Labels */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: 0,
          }}
        >
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 12,
              color: isDark ? "#9CA3AF" : "#6B7280",
            }}
          >
            No resonance
          </Text>
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 12,
              color: isDark ? "#9CA3AF" : "#6B7280",
            }}
          >
            Deep resonance
          </Text>
        </View>
      </View>

      {/* Current rating display */}
      <Text
        style={{
          fontFamily: "Inter_600SemiBold",
          fontSize: 48,
          color: "#477b78",
          textAlign: "center",
          marginTop: 24,
        }}
      >
        {rating}
      </Text>
    </View>
  );
}

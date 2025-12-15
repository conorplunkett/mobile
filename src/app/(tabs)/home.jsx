import {
  View,
  Text,
  Pressable,
  useColorScheme,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
  Image,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Settings } from "lucide-react-native";
import {
  useFonts,
  DMSerifDisplay_400Regular,
} from "@expo-google-fonts/dm-serif-display";
import { Inter_400Regular, Inter_600SemiBold } from "@expo-google-fonts/inter";
import RatingSlider from "../../components/RatingSlider";
import { COLOR_PRIMARY } from "../../utils/colors";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [userHash, setUserHash] = useState(null);
  const [user, setUser] = useState(null);
  const [verse, setVerse] = useState(null);
  const [practice, setPractice] = useState(null);
  const [rating, setRating] = useState(3);
  const [hasRated, setHasRated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showGoDeeper, setShowGoDeeper] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [reflection, setReflection] = useState("");

  const [fontsLoaded] = useFonts({
    DMSerifDisplay_400Regular,
    Inter_400Regular,
    Inter_600SemiBold,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const hash = await AsyncStorage.getItem("user_hash");
      setUserHash(hash);

      if (!hash) {
        router.replace("/onboarding/welcome");
        return;
      }

      // Fetch user
      const userResponse = await fetch(`/api/users/${hash}`);
      const userData = await userResponse.json();

      if (userData.success) {
        setUser(userData.user);

        // Fetch daily verse
        const verseResponse = await fetch("/api/verses/daily", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_hash: hash,
            journey_day: userData.user.journey_day + 1,
          }),
        });

        const verseData = await verseResponse.json();

        if (verseData.success) {
          setVerse(verseData.verse);
          setPractice(verseData.practice);

          if (verseData.existing_rating) {
            setRating(verseData.existing_rating.rating);
            setHasRated(true);
          }
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!userHash || !verse) return;

    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const response = await fetch("/api/ratings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_hash: userHash,
          verse_id: verse.id,
          rating,
          journey_day: user.journey_day + 1,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setHasRated(true);
        setUser({ ...user, journey_day: user.journey_day + 1 });
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
    }
  };

  const handleViewGoDeeper = async () => {
    await Haptics.selectionAsync();
    setShowGoDeeper(true);

    // Track that user viewed go deeper
    if (userHash) {
      await fetch("/api/ratings/reflection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_hash: userHash,
          journey_day: user.journey_day,
          viewed_go_deeper: true,
        }),
      });
    }
  };

  const handleSaveReflection = async () => {
    if (!userHash || !reflection.trim()) return;

    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      await fetch("/api/ratings/reflection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_hash: userHash,
          journey_day: user.journey_day,
          reflection: reflection.trim(),
        }),
      });

      setShowReflection(false);
      setReflection("");
    } catch (error) {
      console.error("Error saving reflection:", error);
    }
  };

  if (!fontsLoaded || loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: isDark ? "#121212" : "#FFFFFF",
        }}
      >
        <ActivityIndicator size="large" color={COLOR_PRIMARY} />
      </View>
    );
  }

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const currentDay = user?.journey_day || 0;
  const graceCount = 3 - (user?.grace_days_used || 0);

  // Calculate streak (consecutive days)
  const streak = currentDay; // Simplified - in production would check for gaps

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDark ? "#121212" : "#FFFFFF",
        paddingTop: insets.top,
      }}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header with settings */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 24,
          paddingTop: 20,
          marginBottom: 20,
        }}
      >
        <View>
          <Image
            source={{
              uri: "https://ucarecdn.com/a0fd9767-7c50-4f02-aae5-fa7fe595ab27/-/format/auto/",
            }}
            style={{ width: 40, height: 40, borderRadius: 10, marginBottom: 8 }}
          />
          <Text
            style={{
              fontFamily: "DMSerifDisplay_400Regular",
              fontSize: 32,
            color: COLOR_PRIMARY,
            }}
          >
            Rio
          </Text>
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 15,
              color: isDark ? "#9CA3AF" : "#6B7280",
            }}
          >
            Day {currentDay}/30
          </Text>
        </View>

        <Pressable
          onPress={() => router.push("/(tabs)/settings")}
          style={({ pressed }) => ({
            padding: 8,
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Settings size={28} color={isDark ? "#FFFFFF" : "#000000"} />
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Streak and timeline section */}
        <View
          style={{
            backgroundColor: isDark ? "#1E1E1E" : "#F6F7F9",
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
          }}
        >
          {/* Streak counter */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <Text style={{ fontSize: 32, marginRight: 12 }}>🔥</Text>
            <View>
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 28,
                  color: COLOR_PRIMARY,
                }}
              >
                {streak} day{streak !== 1 ? "s" : ""}
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 13,
                  color: isDark ? "#9CA3AF" : "#6B7280",
                }}
              >
                Current streak
              </Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            {daysOfWeek.map((day, index) => {
              const isCompleted = index < currentDay % 7;
              const isSaturday = index === 5;
              const showGraceDayLogo = isSaturday && isCompleted;

              return (
                <View key={index} style={{ alignItems: "center" }}>
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 12,
                      color: isDark ? "#9CA3AF" : "#6B7280",
                      marginBottom: 8,
                    }}
                  >
                    {day}
                  </Text>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: isCompleted
                        ? COLOR_PRIMARY
                        : isDark
                          ? "#2A2A2A"
                          : "#E5E7EB",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {showGraceDayLogo ? (
                      <Text style={{ fontSize: 14 }}>🕊️</Text>
                    ) : isCompleted ? (
                      <Text style={{ fontSize: 12 }}>✓</Text>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 13,
                color: isDark ? "#9CA3AF" : "#6B7280",
                marginRight: 8,
              }}
            >
              Grace days:
            </Text>
            {[...Array(3)].map((_, i) => (
              <Text key={i} style={{ fontSize: 16, marginHorizontal: 2 }}>
                {i < graceCount ? "🕊️" : "○"}
              </Text>
            ))}
          </View>
        </View>

        {/* Daily verse - hide source until rated */}
        {verse && (
          <View
            style={{
              backgroundColor: isDark ? "#1E1E1E" : "#F6F7F9",
              borderRadius: 20,
              padding: 24,
              marginBottom: 24,
            }}
          >
            <Text
              style={{
                fontFamily: "DMSerifDisplay_400Regular",
                fontSize: 24,
                color: isDark ? "#FFFFFF" : "#000000",
                lineHeight: 34,
                marginBottom: 16,
                textAlign: "center",
              }}
            >
              "{verse.text}"
            </Text>

            {hasRated && (
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 14,
                  color: isDark ? "#9CA3AF" : "#6B7280",
                  textAlign: "center",
                  marginBottom: 12,
                }}
              >
                — {verse.source} • {verse.religion}
              </Text>
            )}

            {hasRated && practice && (
              <Pressable
                onPress={handleViewGoDeeper}
                style={({ pressed }) => ({
                  marginTop: 16,
                  backgroundColor: COLOR_PRIMARY,
                  borderRadius: 12,
                  paddingVertical: 14,
                  alignItems: "center",
                  transform: pressed ? [{ scale: 0.98 }] : [{ scale: 1 }],
                })}
              >
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 15,
                    color: "#FFFFFF",
                  }}
                >
                  Go Deeper
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Rating section */}
        {!hasRated ? (
          <View>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 18,
                color: isDark ? "#FFFFFF" : "#000000",
                textAlign: "center",
                marginBottom: 16,
              }}
            >
              Mark your resonance
            </Text>

            <RatingSlider onRatingChange={setRating} initialRating={3} />

            <Pressable
              onPress={handleSubmitRating}
              style={({ pressed }) => ({
                backgroundColor: COLOR_PRIMARY,
                borderRadius: 28,
                paddingVertical: 18,
                alignItems: "center",
                marginTop: 24,
                transform: pressed ? [{ scale: 0.98 }] : [{ scale: 1 }],
              })}
            >
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 16,
                  color: "#FFFFFF",
                }}
              >
                Submit Rating
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push("/(tabs)/progress")}
              style={({ pressed }) => ({
                backgroundColor: isDark ? "#1E1E1E" : "#F6F7F9",
                borderRadius: 16,
                paddingVertical: 16,
                paddingHorizontal: 24,
                alignItems: "center",
                marginTop: 16,
                borderWidth: 1,
                borderColor: COLOR_PRIMARY,
                transform: pressed ? [{ scale: 0.98 }] : [{ scale: 1 }],
              })}
            >
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 15,
                  color: COLOR_PRIMARY,
                }}
              >
                View Progress
              </Text>
            </Pressable>
          </View>
        ) : (
          <View>
            <View
              style={{
                backgroundColor: "rgba(71, 123, 120, 0.1)",
                borderRadius: 16,
                padding: 20,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 16,
                  color: COLOR_PRIMARY,
                  marginBottom: 8,
                }}
              >
                Today's Rating: {rating}
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 14,
                  color: isDark ? "#9CA3AF" : "#6B7280",
                }}
              >
                Come back tomorrow for your next verse
              </Text>
            </View>

            <Pressable
              onPress={() => router.push("/(tabs)/progress")}
              style={({ pressed }) => ({
                backgroundColor: isDark ? "#1E1E1E" : "#F6F7F9",
                borderRadius: 16,
                paddingVertical: 16,
                paddingHorizontal: 24,
                alignItems: "center",
                marginTop: 24,
                borderWidth: 1,
                borderColor: COLOR_PRIMARY,
                transform: pressed ? [{ scale: 0.98 }] : [{ scale: 1 }],
              })}
            >
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 15,
                  color: COLOR_PRIMARY,
                }}
              >
                View Progress
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* Go Deeper Modal */}
      <Modal
        visible={showGoDeeper}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowGoDeeper(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: isDark ? "#121212" : "#FFFFFF",
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          }}
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingHorizontal: 32,
              paddingTop: 20,
              paddingBottom: 40,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 32,
              }}
            >
              <Text
                style={{
                  fontFamily: "DMSerifDisplay_400Regular",
                  fontSize: 28,
                  color: COLOR_PRIMARY,
                }}
              >
                Go Deeper
              </Text>
              <Pressable
                onPress={() => setShowGoDeeper(false)}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 16,
                    color: COLOR_PRIMARY,
                  }}
                >
                  Done
                </Text>
              </Pressable>
            </View>

            {practice && (
              <>
                <View
                  style={{
                    backgroundColor: isDark ? "#1E1E1E" : "#F6F7F9",
                    borderRadius: 16,
                    padding: 24,
                    marginBottom: 24,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 16,
                        color: COLOR_PRIMARY,
                      marginBottom: 12,
                    }}
                  >
                    Today's Practice
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 15,
                      color: isDark ? "#FFFFFF" : "#000000",
                      lineHeight: 24,
                      marginBottom: 16,
                    }}
                  >
                    {practice.tenet}
                  </Text>

                  <View
                    style={{
                      backgroundColor: isDark ? "#121212" : "#FFFFFF",
                      borderRadius: 12,
                      padding: 16,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Inter_400Regular",
                        fontSize: 14,
                        color: isDark ? "#9CA3AF" : "#6B7280",
                        lineHeight: 22,
                      }}
                    >
                      {practice.daily_action}
                    </Text>
                  </View>
                </View>

                <Pressable
                  onPress={() => {
                    setShowGoDeeper(false);
                    setShowReflection(true);
                  }}
                  style={({ pressed }) => ({
                    backgroundColor: COLOR_PRIMARY,
                    borderRadius: 28,
                    paddingVertical: 18,
                    alignItems: "center",
                    transform: pressed ? [{ scale: 0.98 }] : [{ scale: 1 }],
                  })}
                >
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 16,
                      color: "#FFFFFF",
                    }}
                  >
                    Before I go to bed, tell Rio how it made me feel
                  </Text>
                </Pressable>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* End of Day Reflection Modal */}
      <Modal
        visible={showReflection}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowReflection(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: isDark ? "#121212" : "#FFFFFF",
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          }}
        >
          <View style={{ flex: 1, paddingHorizontal: 32, paddingTop: 20 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 32,
              }}
            >
              <Text
                style={{
                  fontFamily: "DMSerifDisplay_400Regular",
                  fontSize: 28,
                  color: COLOR_PRIMARY,
                }}
              >
                End of Day
              </Text>
              <Pressable
                onPress={() => setShowReflection(false)}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 16,
                    color: COLOR_PRIMARY,
                  }}
                >
                  Cancel
                </Text>
              </Pressable>
            </View>

            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 15,
                color: isDark ? "#9CA3AF" : "#6B7280",
                marginBottom: 16,
              }}
            >
              How did today's practice make you feel?
            </Text>

            <TextInput
              value={reflection}
              onChangeText={setReflection}
              placeholder="Share your thoughts..."
              placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
              multiline
              numberOfLines={6}
              style={{
                backgroundColor: isDark ? "#1E1E1E" : "#F6F7F9",
                borderRadius: 16,
                padding: 16,
                fontFamily: "Inter_400Regular",
                fontSize: 15,
                color: isDark ? "#FFFFFF" : "#000000",
                height: 160,
                textAlignVertical: "top",
                marginBottom: 24,
              }}
            />

            <Pressable
              onPress={handleSaveReflection}
              disabled={!reflection.trim()}
              style={({ pressed }) => ({
                backgroundColor: reflection.trim() ? COLOR_PRIMARY : "#D1D5DB",
                borderRadius: 28,
                paddingVertical: 18,
                alignItems: "center",
                transform: pressed ? [{ scale: 0.98 }] : [{ scale: 1 }],
              })}
            >
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 16,
                  color: "#FFFFFF",
                }}
              >
                Save Reflection
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

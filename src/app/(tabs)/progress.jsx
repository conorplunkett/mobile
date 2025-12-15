import {
  View,
  Text,
  useColorScheme,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { ChevronLeft } from "lucide-react-native";
import { useRouter } from "expo-router";
import {
  useFonts,
  DMSerifDisplay_400Regular,
} from "@expo-google-fonts/dm-serif-display";
import { Inter_400Regular, Inter_600SemiBold } from "@expo-google-fonts/inter";
import { COLOR_PRIMARY, COLOR_MUTED } from "../../utils/colors";
import {
  RATING_EMOJI_BY_SCORE,
  RATING_LABEL_BY_SCORE,
} from "../../constants/ratingScale";

const CURRENT_ALIGNMENT_SAMPLE = [
  { id: "christianity", name: "Christianity", percentage: 82, order: 0 },
  { id: "buddhism", name: "Buddhism", percentage: 70, order: 1 },
  { id: "judaism", name: "Judaism", percentage: 65, order: 2 },
  { id: "islam", name: "Islam", percentage: 40, order: 3 },
  { id: "hinduism", name: "Hinduism", percentage: 28, order: 4 },
  { id: "sikhism", name: "Sikhism", percentage: 19, order: 5 },
  { id: "taoism", name: "Taoism", percentage: 14, order: 6 },
  { id: "bahai", name: "Baha'i Faith", percentage: 7, order: 7 },
  { id: "jainism", name: "Jainism", percentage: 2, order: 8 },
  { id: "shinto", name: "Shinto", percentage: 0, order: 9 },
  { id: "confucianism-alignment", name: "Confucianism", percentage: 0, order: 10 },
];

const RATING_HISTORY_ENTRIES = [
  {
    id: "christianity-new-testament",
    date: "May 12",
    rating: 5,
    verse:
      "Let us not love with words or speech but with actions and in truth.",
    reference: "1 John 3:18",
    attribution: "Christianity - New Testament",
  },
  {
    id: "judaism-tanakh",
    date: "May 11",
    rating: 4,
    verse:
      "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways acknowledge Him, and He will make your paths straight.",
    reference: "Proverbs 3:5-6",
    attribution: "Judaism - Hebrew Bible / Tanakh",
  },
  {
    id: "islam-quran",
    date: "May 10",
    rating: 4,
    verse:
      "Indeed, God does not change the condition of a people until they change what is in themselves.",
    reference: "Qur'an 13:11",
    attribution: "Islam - Qur'an",
  },
  {
    id: "hinduism-gita",
    date: "May 9",
    rating: 5,
    verse:
      "You have a right to your actions, but never to your results. Act without attachment to success or failure, and your deeds will bring peace.",
    reference: "Gita 2:47",
    attribution: "Hinduism - Bhagavad Gita",
  },
  {
    id: "buddhism-dhammapada",
    date: "May 8",
    rating: 3,
    verse:
      "All that we are is the result of what we have thought. The mind is everything. What we think, we become.",
    reference: "Dhammapada 1:1",
    attribution: "Buddhism - Dhammapada",
  },
  {
    id: "sikhism-guru-granth",
    date: "May 7",
    rating: 4,
    verse: "By conquering your mind, you conquer the world.",
    reference: null,
    attribution: "Sikhism - Guru Granth Sahib",
  },
  {
    id: "taoism-tao-te-ching",
    date: "May 6",
    rating: 3,
    verse:
      "Knowing others is intelligence; knowing yourself is true wisdom. Mastering others is strength; mastering yourself is true power.",
    reference: "Tao Te Ching 33",
    attribution: "Taoism - Tao Te Ching",
  },
  {
    id: "confucianism",
    date: "May 5",
    rating: 2,
    verse: "The man who moves a mountain begins by carrying away small stones.",
    reference: null,
    attribution: "Confucianism",
  },
  {
    id: "bahai-faith",
    date: "May 4",
    rating: 1,
    verse: "So powerful is the light of unity that it can illuminate the whole earth.",
    reference: null,
    attribution: "Baha'i Faith",
  },
  {
    id: "indigenous-lakota",
    date: "May 3",
    rating: 3,
    verse:
      "The longest journey you will ever take is from your head to your heart.",
    reference: null,
    attribution: "Indigenous / Native American (Lakota - attributed)",
  },
];

export default function ProgressScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [userHash, setUserHash] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);

  const [fontsLoaded] = useFonts({
    DMSerifDisplay_400Regular,
    Inter_400Regular,
    Inter_600SemiBold,
  });

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const hash = await AsyncStorage.getItem("user_hash");
      setUserHash(hash);

      if (!hash) return;

      const response = await fetch(`/api/progress/${hash}`);
      const data = await response.json();

      if (data.success) {
        setProgressData(data);
      }
    } catch (error) {
      console.error("Error loading progress:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!userHash || progressData.totalRatings < 20) return;

    setGeneratingReport(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_hash: userHash }),
      });

      const data = await response.json();

      if (data.success) {
        // Report generated successfully
        await loadProgress();
      }
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setGeneratingReport(false);
    }
  };

  const currentDay = progressData?.user?.journey_day || 0;
  const daysRemaining = Math.max(0, 30 - currentDay);
  const totalRatings = progressData?.totalRatings || 0;
  const canGenerateReport = totalRatings >= 20;
  const hasRatingHistory = totalRatings > 0 && RATING_HISTORY_ENTRIES.length > 0;
  const currentAlignmentEntries = [...CURRENT_ALIGNMENT_SAMPLE].sort((a, b) => {
    if (b.percentage === a.percentage) {
      return a.order - b.order;
    }
    return b.percentage - a.percentage;
  });
  const topAlignmentPercentage =
    currentAlignmentEntries.length > 0 ? currentAlignmentEntries[0].percentage : 0;

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

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDark ? "#121212" : "#FFFFFF",
        paddingTop: insets.top,
      }}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header with back button */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 24,
          paddingTop: 20,
          marginBottom: 20,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({
            padding: 8,
            opacity: pressed ? 0.6 : 1,
            marginRight: 12,
          })}
        >
          <ChevronLeft size={28} color={isDark ? "#FFFFFF" : "#000000"} />
        </Pressable>
        <Text
          style={{
            fontFamily: "DMSerifDisplay_400Regular",
            fontSize: 32,
            color: COLOR_PRIMARY,
          }}
        >
          Your Journey
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 15,
            color: isDark ? "#9CA3AF" : "#6B7280",
            marginBottom: 32,
          }}
        >
          Track your spiritual exploration
        </Text>

        {/* Progress overview */}
        <View
          style={{
            backgroundColor: isDark ? "#1E1E1E" : "#F6F7F9",
            borderRadius: 20,
            padding: 24,
            marginBottom: 24,
          }}
        >
          <View style={{ marginBottom: 20 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 16,
                  color: isDark ? "#FFFFFF" : "#000000",
                }}
              >
                Journey Progress
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 16,
                  color: COLOR_PRIMARY,
                }}
              >
                {currentDay}/30
              </Text>
            </View>

            <View
              style={{
                height: 8,
                backgroundColor: isDark ? "#2A2A2A" : "#E5E7EB",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  width: `${(currentDay / 30) * 100}%`,
                  height: "100%",
                  backgroundColor: COLOR_PRIMARY,
                }}
              />
            </View>

            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 13,
                color: isDark ? "#9CA3AF" : "#6B7280",
                marginTop: 8,
              }}
            >
              {daysRemaining} days remaining
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              paddingTop: 20,
              borderTopWidth: 1,
              borderTopColor: isDark ? "#2A2A2A" : "#E5E7EB",
            }}
          >
            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 24,
                  color: COLOR_PRIMARY,
                  marginBottom: 4,
                }}
              >
                {totalRatings}
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 13,
                  color: isDark ? "#9CA3AF" : "#6B7280",
                }}
              >
                Verses Rated
              </Text>
            </View>

            <View
              style={{
                width: 1,
                backgroundColor: isDark ? "#2A2A2A" : "#E5E7EB",
              }}
            />

            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 24,
                  color: COLOR_PRIMARY,
                  marginBottom: 4,
                }}
              >
                {progressData?.user?.selected_religions?.length || 0}
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 13,
                  color: isDark ? "#9CA3AF" : "#6B7280",
                }}
              >
                Traditions
              </Text>
            </View>
          </View>
        </View>

        {/* Religion alignment */}
        {currentAlignmentEntries.length > 0 && (
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
                fontFamily: "Inter_600SemiBold",
                fontSize: 18,
                color: isDark ? "#FFFFFF" : "#000000",
                marginBottom: 20,
              }}
            >
              Current Alignment
            </Text>

            {currentAlignmentEntries.map((entry) => (
              <View key={entry.id} style={{ marginBottom: 16 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 14,
                      color: isDark ? "#FFFFFF" : "#000000",
                    }}
                  >
                    {entry.name}
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 14,
                      color: COLOR_PRIMARY,
                    }}
                  >
                    {entry.percentage}%
                  </Text>
                </View>

                <View
                  style={{
                    height: 6,
                    backgroundColor: isDark ? "#2A2A2A" : "#E5E7EB",
                    borderRadius: 3,
                    overflow: "hidden",
                  }}
                >
                  <View
                    style={{
                      width: `${entry.percentage}%`,
                      height: "100%",
                      backgroundColor:
                        entry.percentage === topAlignmentPercentage
                          ? COLOR_PRIMARY
                          : COLOR_MUTED,
                    }}
                  />
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Generate report */}
        <View
          style={{
            backgroundColor: isDark ? "#1E1E1E" : "#F6F7F9",
            borderRadius: 20,
            padding: 24,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 16,
              color: isDark ? "#FFFFFF" : "#000000",
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            {canGenerateReport
              ? "Ready for your full report"
              : `${20 - totalRatings} more ratings needed`}
          </Text>

          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 14,
              color: isDark ? "#9CA3AF" : "#6B7280",
              marginBottom: 20,
              textAlign: "center",
            }}
          >
            {canGenerateReport
              ? "Generate your detailed spiritual alignment report"
              : "Complete at least 20 ratings to unlock your report"}
          </Text>

          <Pressable
            onPress={handleGenerateReport}
            disabled={!canGenerateReport || generatingReport}
            style={({ pressed }) => ({
              backgroundColor: canGenerateReport ? COLOR_PRIMARY : "#D1D5DB",
              borderRadius: 28,
              paddingHorizontal: 32,
              paddingVertical: 16,
              transform: pressed ? [{ scale: 0.98 }] : [{ scale: 1 }],
            })}
          >
            {generatingReport ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 15,
                  color: "#FFFFFF",
                }}
              >
                Generate Report
              </Text>
            )}
          </Pressable>
        </View>

        {/* History timeline */}
        {hasRatingHistory && (
          <View style={{ marginTop: 32 }}>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 18,
                color: isDark ? "#FFFFFF" : "#000000",
                marginBottom: 16,
              }}
            >
              History
            </Text>

            <View
              style={{
                backgroundColor: isDark ? "#1E1E1E" : "#F6F7F9",
                borderRadius: 20,
                paddingVertical: 8,
                paddingHorizontal: 24,
              }}
            >
              {RATING_HISTORY_ENTRIES.map((entry, index) => (
                <View key={entry.id} style={{ paddingVertical: 16 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 14,
                        color: isDark ? "#E5E7EB" : "#374151",
                      }}
                    >
                      {entry.date}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        flexShrink: 1,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Inter_400Regular",
                          fontSize: 12,
                          color: isDark ? "#9CA3AF" : "#6B7280",
                          marginRight: 6,
                        }}
                        numberOfLines={1}
                      >
                        {RATING_LABEL_BY_SCORE[entry.rating]}
                      </Text>
                      <Text style={{ fontSize: 24 }}>
                        {RATING_EMOJI_BY_SCORE[entry.rating]}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 16,
                      color: isDark ? "#FFFFFF" : "#111827",
                      lineHeight: 24,
                      marginBottom: entry.reference ? 6 : 10,
                    }}
                  >
                    {entry.verse}
                  </Text>

                  {entry.reference && (
                    <Text
                      style={{
                        fontFamily: "Inter_400Regular",
                        fontSize: 14,
                        color: isDark ? "#9CA3AF" : "#6B7280",
                        marginBottom: 10,
                      }}
                    >
                      {entry.reference}
                    </Text>
                  )}

                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 13,
                      color: isDark ? "#9CA3AF" : "#6B7280",
                      textTransform: "none",
                    }}
                  >
                    {entry.attribution}
                  </Text>

                  {index < RATING_HISTORY_ENTRIES.length - 1 && (
                    <View
                      style={{
                        height: 1,
                        backgroundColor: isDark ? "#2A2A2A" : "#E5E7EB",
                        marginTop: 16,
                      }}
                    />
                  )}
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

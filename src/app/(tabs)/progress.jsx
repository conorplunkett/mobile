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

  const currentDay = progressData?.user?.journey_day || 0;
  const daysRemaining = Math.max(0, 30 - currentDay);
  const totalRatings = progressData?.totalRatings || 0;
  const canGenerateReport = totalRatings >= 20;

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
        {progressData?.religionPercentages &&
          Object.keys(progressData.religionPercentages).length > 0 && (
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

              {Object.entries(progressData.religionPercentages)
                .sort(([, a], [, b]) => b - a)
                .map(([religion, percentage], index) => (
                  <View key={index} style={{ marginBottom: 16 }}>
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
                          fontSize: 14,
                          color: isDark ? "#FFFFFF" : "#000000",
                        }}
                      >
                        {religion}
                      </Text>
                      <Text
                        style={{
                          fontFamily: "Inter_600SemiBold",
                          fontSize: 14,
                          color: COLOR_PRIMARY,
                        }}
                      >
                        {percentage}%
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
                          width: `${percentage}%`,
                          height: "100%",
                          backgroundColor:
                            index === 0 ? COLOR_PRIMARY : COLOR_MUTED,
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
      </ScrollView>
    </View>
  );
}

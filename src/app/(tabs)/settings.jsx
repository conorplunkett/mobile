import {
  View,
  Text,
  Pressable,
  useColorScheme,
  ScrollView,
  ActivityIndicator,
  Switch,
  Alert,
  TextInput,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import { ChevronRight, ChevronLeft } from "lucide-react-native";
import {
  useFonts,
  DMSerifDisplay_400Regular,
} from "@expo-google-fonts/dm-serif-display";
import { Inter_400Regular, Inter_600SemiBold } from "@expo-google-fonts/inter";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { COLOR_PRIMARY } from "../../utils/colors";
import {
  DEFAULT_USER_NAME,
  getStoredUserName,
  saveUserName,
} from "../../utils/userName";
import {
  DEFAULT_INTERPRETATION_SUMMARY,
  getStoredInterpretationSummary,
  saveInterpretationSummary,
} from "../../utils/interpretationSummary";

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [userHash, setUserHash] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prepopulate, setPrepopulate] = useState(false);
  const [customName, setCustomName] = useState(DEFAULT_USER_NAME);
  const [summaryText, setSummaryText] = useState(
    DEFAULT_INTERPRETATION_SUMMARY,
  );

  const [fontsLoaded] = useFonts({
    DMSerifDisplay_400Regular,
    Inter_400Regular,
    Inter_600SemiBold,
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const hash = await AsyncStorage.getItem("user_hash");
      setUserHash(hash);

      const storedName = await getStoredUserName();
      setCustomName(storedName);
      const storedSummary = await getStoredInterpretationSummary();
      setSummaryText(storedSummary);

      if (!hash) return;

      const response = await fetch(`/api/users/${hash}`);
      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        // Set prepopulate based on journey_day
        setPrepopulate(data.user.journey_day === 5);
      }
    } catch (error) {
      console.error("Error loading user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSetting = async (setting, value) => {
    if (!userHash) return;

    try {
      await Haptics.selectionAsync();

      const response = await fetch(`/api/users/${userHash}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [setting]: value }),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
      }
    } catch (error) {
      console.error("Error updating setting:", error);
    }
  };

  const handleCopyUserId = async () => {
    if (!userHash) return;

    await Haptics.selectionAsync();
    await Clipboard.setStringAsync(userHash);

    Alert.alert("Copied", "User ID copied to clipboard");
  };

  const handleResetOnboarding = async () => {
    Alert.alert(
      "Reset Onboarding",
      "This will clear all your data and restart the onboarding process. Are you sure?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            await Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Warning,
            );

            // Clear all onboarding data
            await AsyncStorage.multiRemove([
              "user_hash",
              "onboarding_complete",
              "has_subscription",
              "primary_intent",
              "emotional_driver",
              "background",
              "background_note",
              "format_preference",
              "selected_religions",
              "custom_religion",
            ]);

            // Navigate to welcome screen
            router.replace("/onboarding/welcome");
          },
        },
      ],
    );
  };

  const handleTogglePrepopulate = async (value) => {
    if (!userHash) return;

    try {
      await Haptics.selectionAsync();
      setPrepopulate(value);

      if (value) {
        // Set to day 5 and seed ratings so the timeline/progress actually looks populated
        const response = await fetch(`/api/users/${userHash}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ journey_day: 5 }),
        });

        const data = await response.json();
        if (data.success) {
          setUser(data.user);

          // Dev helper: seed ratings for days 1–5 so progress and timeline show history
          try {
            for (let day = 1; day <= 5; day++) {
              await fetch("/api/ratings/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  user_hash: userHash,
                  verse_id: 1, // any valid verse id (mock API joins this back to a verse)
                  rating: 3, // neutral rating
                  journey_day: day,
                }),
              });
            }
          } catch (seedError) {
            console.error("Error seeding prepopulated ratings:", seedError);
          }
        }
      } else {
        // Reset to day 0. We leave any existing ratings in place.
        const response = await fetch(`/api/users/${userHash}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ journey_day: 0 }),
        });

        const data = await response.json();
        if (data.success) {
          setUser(data.user);
        }
      }
    } catch (error) {
      console.error("Error toggling prepopulate:", error);
    }
  };

  const handleSendTestNotification = async () => {
    try {
      await Haptics.selectionAsync();

      const { status } = await Notifications.getPermissionsAsync();
      let finalStatus = status;

      if (status !== "granted") {
        const permissionResponse = await Notifications.requestPermissionsAsync();
        finalStatus = permissionResponse.status;
      }

      if (finalStatus !== "granted") {
        Alert.alert(
          "Notifications Disabled",
          "Enable notifications to receive test alerts.",
        );
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Rio",
          body: "texst notificaiton",
        },
        trigger: { seconds: 5 },
      });

      Alert.alert("Sent", "Test notification scheduled.");
    } catch (error) {
      console.error("Error sending test notification:", error);
      Alert.alert("Error", "Unable to send test notification right now.");
    }
  };

  const handleSavePreviewName = async () => {
    const savedName = await saveUserName(customName);
    setCustomName(savedName);
  };

  const handleSaveSummary = async () => {
    const savedSummary = await saveInterpretationSummary(summaryText);
    setSummaryText(savedSummary);
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
          Settings
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* App Preferences */}
        <View style={{ marginBottom: 32 }}>
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 13,
              color: isDark ? "#9CA3AF" : "#6B7280",
              marginBottom: 12,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            App Preferences
          </Text>

          <View
            style={{
              backgroundColor: isDark ? "#1E1E1E" : "#F6F7F9",
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: isDark ? "#2A2A2A" : "#E5E7EB",
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 15,
                  color: isDark ? "#FFFFFF" : "#000000",
                }}
              >
                Notifications
              </Text>
              <Switch
                value={user?.notifications_enabled ?? true}
                onValueChange={(value) =>
                  handleToggleSetting("notifications_enabled", value)
                }
                trackColor={{ false: "#D1D5DB", true: COLOR_PRIMARY }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: isDark ? "#2A2A2A" : "#E5E7EB",
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 15,
                  color: isDark ? "#FFFFFF" : "#000000",
                }}
              >
                Dark Mode
              </Text>
              <Switch
                value={user?.dark_mode_enabled ?? false}
                onValueChange={(value) =>
                  handleToggleSetting("dark_mode_enabled", value)
                }
                trackColor={{ false: "#D1D5DB", true: COLOR_PRIMARY }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: isDark ? "#2A2A2A" : "#E5E7EB",
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 15,
                  color: isDark ? "#FFFFFF" : "#000000",
                }}
              >
                Haptics
              </Text>
              <Switch
                value={user?.haptics_enabled ?? true}
                onValueChange={(value) =>
                  handleToggleSetting("haptics_enabled", value)
                }
                trackColor={{ false: "#D1D5DB", true: COLOR_PRIMARY }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 16,
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 15,
                  color: isDark ? "#FFFFFF" : "#000000",
                }}
              >
                Audio
              </Text>
              <Switch
                value={user?.audio_enabled ?? true}
                onValueChange={(value) =>
                  handleToggleSetting("audio_enabled", value)
                }
                trackColor={{ false: "#D1D5DB", true: COLOR_PRIMARY }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Help & Legal */}
        <View style={{ marginBottom: 32 }}>
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 13,
              color: isDark ? "#9CA3AF" : "#6B7280",
              marginBottom: 12,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Help & Legal
          </Text>

          <View
            style={{
              backgroundColor: isDark ? "#1E1E1E" : "#F6F7F9",
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            <Pressable
              style={({ pressed }) => ({
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: isDark ? "#2A2A2A" : "#E5E7EB",
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 15,
                  color: isDark ? "#FFFFFF" : "#000000",
                }}
              >
                Feedback
              </Text>
              <ChevronRight size={20} color={isDark ? "#9CA3AF" : "#6B7280"} />
            </Pressable>

            <Pressable
              style={({ pressed }) => ({
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: isDark ? "#2A2A2A" : "#E5E7EB",
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 15,
                  color: isDark ? "#FFFFFF" : "#000000",
                }}
              >
                Terms of Service
              </Text>
              <ChevronRight size={20} color={isDark ? "#9CA3AF" : "#6B7280"} />
            </Pressable>

            <Pressable
              style={({ pressed }) => ({
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 16,
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 15,
                  color: isDark ? "#FFFFFF" : "#000000",
                }}
              >
                Privacy Policy
              </Text>
              <ChevronRight size={20} color={isDark ? "#9CA3AF" : "#6B7280"} />
            </Pressable>
          </View>
        </View>

        {/* User ID */}
        <Pressable
          onPress={handleCopyUserId}
          style={({ pressed }) => ({
            backgroundColor: isDark ? "#1E1E1E" : "#F6F7F9",
            borderRadius: 16,
            padding: 16,
            marginBottom: 32,
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 11,
              color: isDark ? "#9CA3AF" : "#6B7280",
              marginBottom: 4,
            }}
          >
            User ID (tap to copy)
          </Text>
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 12,
              color: isDark ? "#FFFFFF" : "#000000",
            }}
          >
            {userHash}
          </Text>
        </Pressable>

        {/* Developer */}
        <View style={{ marginBottom: 32 }}>
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 13,
              color: isDark ? "#9CA3AF" : "#6B7280",
              marginBottom: 12,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Developer
          </Text>

          <View
            style={{
              backgroundColor: isDark ? "#1E1E1E" : "#F6F7F9",
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: isDark ? "#2A2A2A" : "#E5E7EB",
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 15,
                  color: isDark ? "#FFFFFF" : "#000000",
                }}
              >
                Prepopulate Timeline
              </Text>
              <Switch
                value={prepopulate}
                onValueChange={handleTogglePrepopulate}
                trackColor={{ false: "#D1D5DB", true: COLOR_PRIMARY }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: isDark ? "#2A2A2A" : "#E5E7EB",
              }}
            >
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 15,
                    color: isDark ? "#FFFFFF" : "#000000",
                    marginBottom: 4,
                  }}
                >
                  Preview Name
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 13,
                    color: isDark ? "#9CA3AF" : "#6B7280",
                  }}
                >
                  Used across preview screens like Final Report.
                </Text>
              </View>
              <TextInput
                value={customName}
                onChangeText={setCustomName}
                onBlur={handleSavePreviewName}
                onSubmitEditing={handleSavePreviewName}
                placeholder={DEFAULT_USER_NAME}
                placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                style={{
                  minWidth: 140,
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: isDark ? "#2A2A2A" : "#E5E7EB",
                  backgroundColor: isDark ? "#121212" : "#FFFFFF",
                  fontFamily: "Inter_400Regular",
                  fontSize: 14,
                  color: isDark ? "#FFFFFF" : "#000000",
                }}
                returnKeyType="done"
              />
            </View>

            <View
              style={{
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: isDark ? "#2A2A2A" : "#E5E7EB",
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 15,
                  color: isDark ? "#FFFFFF" : "#000000",
                  marginBottom: 4,
                }}
              >
                Interpretation Summary
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 13,
                  color: isDark ? "#9CA3AF" : "#6B7280",
                  marginBottom: 12,
                }}
              >
                Controls the copy under the Interpretation Summary section on the
                Final Report preview.
              </Text>
              <TextInput
                multiline
                value={summaryText}
                onChangeText={setSummaryText}
                onBlur={handleSaveSummary}
                placeholder={DEFAULT_INTERPRETATION_SUMMARY}
                placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                style={{
                  minHeight: 120,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: isDark ? "#2A2A2A" : "#E5E7EB",
                  backgroundColor: isDark ? "#121212" : "#FFFFFF",
                  padding: 14,
                  fontFamily: "Inter_400Regular",
                  fontSize: 14,
                  color: isDark ? "#FFFFFF" : "#000000",
                  textAlignVertical: "top",
                }}
                returnKeyType="done"
              />
            </View>

            <Pressable
              onPress={handleSendTestNotification}
              style={({ pressed }) => ({
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: isDark ? "#2A2A2A" : "#E5E7EB",
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 15,
                  color: isDark ? "#FFFFFF" : "#000000",
                }}
              >
                Send Test Notification
              </Text>
              <ChevronRight size={20} color={isDark ? "#9CA3AF" : "#6B7280"} />
            </Pressable>

            <Pressable
              onPress={handleResetOnboarding}
              style={({ pressed }) => ({
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 16,
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 15,
                  color: "#DC2626",
                }}
              >
                Reset Onboarding
              </Text>
              <ChevronRight size={20} color="#DC2626" />
            </Pressable>
          </View>
        </View>

        {/* Version */}
        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 13,
            color: isDark ? "#6B7280" : "#9CA3AF",
            textAlign: "center",
          }}
        >
          Rio v1.0.0
        </Text>
      </ScrollView>
    </View>
  );
}

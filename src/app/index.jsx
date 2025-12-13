import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const userHash = await AsyncStorage.getItem("user_hash");
      const hasCompletedOnboarding = await AsyncStorage.getItem(
        "onboarding_complete",
      );
      const hasSubscription = await AsyncStorage.getItem("has_subscription");

      if (!userHash || !hasCompletedOnboarding) {
        router.replace("/onboarding/welcome");
      } else if (!hasSubscription) {
        router.replace("/paywall");
      } else {
        router.replace("/(tabs)/home");
      }
    } catch (error) {
      console.error("Error checking status:", error);
      router.replace("/onboarding/welcome");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#477b78" />
      </View>
    );
  }

  return null;
}

// components/AnimatedSplash.tsx
import React, { useEffect, useRef } from "react";
import { View, StyleSheet,Text,Image } from "react-native";
import LottieView from "lottie-react-native";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync(); // stop auto hide

export default function AnimatedSplash({ onFinish }) {
  const animationRef = useRef(null);

  useEffect(() => {
    // ✅ Hide native splash as soon as this component mounts
    const hide = async () => {
      await SplashScreen.hideAsync();
    };
    hide();

    return () => {};
  }, []);

  return (
    <View style={styles.container}>
            <Image
        source={require("../assets/logo_dark.png")}
        style={{ width: 200, height: 100, marginBottom:50 }}
      />
      <LottieView
        ref={animationRef}
        source={require("../assets/SplashAnimation.json")}
        autoPlay
        loop={false}
        style={{ width: 400, height: 400,backgroundColor:"black" }}
        onAnimationFinish={() => {
          onFinish(); // switch to real app when animation ends
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:"black", // must match app.json splash background
    alignItems: "center",
    justifyContent: "center",
  },
});

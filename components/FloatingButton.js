import React, { useRef } from "react";
import { Animated, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function FloatingButton({ onPress }) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.7,   // scale down to 90%
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,    // scale back to original size
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={{ position: "absolute", bottom: 50, right: 15 }}
    >
      <Animated.View
        style={{
          transform: [{ scale }],
          backgroundColor: "#065f73",
          width: 100,
          height: 100,
          borderRadius: 50,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOffset: { width: 2, height: 10 },
          shadowOpacity: 1,
          shadowRadius: 10,
          elevation: 50,
        }}
      >
        <Ionicons name="person-add" size={50} color="white" />
      </Animated.View>
    </Pressable>
  );
}
